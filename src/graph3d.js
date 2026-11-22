export class KnowledgeGraph3D {
  constructor(canvas, viewport, { nodes, edges, groupMeta, ranks, layoutWidth, layoutHeight, onSelect, onViewChange }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.viewport = viewport;
    this.tooltip = viewport.querySelector("#graph-tooltip");
    this.onSelect = onSelect;
    this.onViewChange = onViewChange;
    this.nodes = nodes;
    this.edges = edges;
    this.groupMeta = groupMeta;
    this.ranks = ranks;
    this.layoutWidth = layoutWidth;
    this.layoutHeight = layoutHeight;
    this.enabled = false;
    this.paused = false;
    this.frame = 0;
    this.lastTime = 0;
    this.width = 1;
    this.height = 1;
    this.dpr = 1;
    this.yaw = 0;
    this.pitch = 0;
    this.distance = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.targetZ = 0;
    this.panX = 0;
    this.panY = 0;
    this.baseScale = 1;
    this.maxRank = 1;
    this.depthScale = 42;
    this.selectedID = null;
    this.prerequisites = [];
    this.extensions = [];
    this.query = "";
    this.hoveredID = null;
    this.projected = [];
    this.labelBoxes = [];
    this.gesture = null;
    this.animation = null;
    this.bindEvents();
    this.resize();
  }

  bindEvents() {
    this.canvas.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 && event.button !== 2) return;
      this.canvas.focus({ preventScroll: true });
      const hit = this.hitTest(event.offsetX, event.offsetY);
      this.gesture = {
        pointerID: event.pointerId,
        button: event.button,
        x: event.clientX,
        y: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        moved: false,
        nodeID: hit?.node.id ?? null,
      };
      this.canvas.classList.add("dragging");
      this.canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    this.canvas.addEventListener("pointermove", (event) => {
      if (this.gesture && this.gesture.pointerID === event.pointerId) {
        const dx = event.clientX - this.gesture.lastX;
        const dy = event.clientY - this.gesture.lastY;
        if (Math.abs(event.clientX - this.gesture.x) + Math.abs(event.clientY - this.gesture.y) > 4) {
          this.gesture.moved = true;
        }
        if (this.gesture.moved) {
      if (this.gesture.button === 2) {
            this.panX += dx;
            this.panY += dy;
          } else {
            this.yaw += dx * 0.006;
            this.pitch = Math.max(-1.25, Math.min(1.25, this.pitch + dy * 0.005));
          }
        }
        this.gesture.lastX = event.clientX;
        this.gesture.lastY = event.clientY;
      } else {
        this.updateHover(event.offsetX, event.offsetY, event.clientX, event.clientY);
      }
    });
    this.canvas.addEventListener("pointerup", (event) => {
      if (!this.gesture || this.gesture.pointerID !== event.pointerId) return;
      const gesture = this.gesture;
      this.gesture = null;
      this.canvas.classList.remove("dragging");
      if (!gesture.moved && gesture.nodeID) this.onSelect?.(gesture.nodeID);
      if (gesture.moved) this.onViewChange?.();
      if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    });
    this.canvas.addEventListener("pointercancel", () => { this.gesture = null; this.canvas.classList.remove("dragging"); });
    this.canvas.addEventListener("pointerleave", () => {
      if (!this.gesture) this.setHover(null);
    });
    this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    this.canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.distance = Math.max(480, Math.min(9000, this.distance * (event.deltaY > 0 ? 1.1 : 0.91)));
      this.onViewChange?.();
    }, { passive: false });
    this.canvas.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      const speed = Math.max(18, this.distance * 0.035);
      const forwardX = Math.sin(this.yaw), forwardY = -Math.cos(this.yaw);
      const rightX = Math.cos(this.yaw), rightY = Math.sin(this.yaw);
      let handled = true;
      if (key === "w") { this.targetX += forwardX * speed; this.targetY += forwardY * speed; }
      else if (key === "s") { this.targetX -= forwardX * speed; this.targetY -= forwardY * speed; }
      else if (key === "a") { this.targetX -= rightX * speed; this.targetY -= rightY * speed; }
      else if (key === "d") { this.targetX += rightX * speed; this.targetY += rightY * speed; }
      else if (key === "q") this.targetZ -= speed;
      else if (key === "e") this.targetZ += speed;
      else handled = false;
      if (handled) { event.preventDefault();this.onViewChange?.(); }
    });
    window.addEventListener("resize", () => this.resize());
  }

  updateData({ nodes = this.nodes, edges = this.edges, groupMeta = this.groupMeta, ranks = this.ranks, layoutWidth = this.layoutWidth, layoutHeight = this.layoutHeight }) {
    this.nodes = nodes;
    this.edges = edges;
    this.groupMeta = groupMeta;
    this.ranks = ranks;
    this.layoutWidth = layoutWidth;
    this.layoutHeight = layoutHeight;
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.baseScale = Math.min(this.width / this.layoutWidth, this.height / this.layoutHeight) * 0.94;
    this.maxRank = Math.max(1, ...this.nodes.map((node) => this.ranks[node.id] ?? 0));
    this.targetZ = ((this.maxRank * this.depthScale) / 2) * this.baseScale;
    if (!this.distance) this.resetView(false);
    else if (this.enabled) this.fitToGraph();
  }

  resetView(animate = true) {
    this.targetX = 0;
    this.targetY = 0;
    this.targetZ = ((this.maxRank * this.depthScale) / 2) * this.baseScale;
    this.panX = 0;
    this.panY = 0;
    this.distance = Math.max(this.width, this.height) * 1.5;
    if (animate) this.animateCamera(0.58, 0.48, 350, () => {this.fitToGraph();this.onViewChange?.();});
    else { this.yaw = 0.58; this.pitch = 0.48; this.fitToGraph();this.onViewChange?.(); }
  }

  animateCamera(yaw, pitch, duration = 600, onDone) {
    const from = { yaw: this.yaw, pitch: this.pitch, start: performance.now() };
    this.animation = { ...from, yawTo: yaw, pitchTo: pitch, duration, onDone };
  }

  enter3D() {
    this.enabled = true;
    this.paused = false;
    this.yaw = 0;
    this.pitch = 0;
    this.panX = 0;
    this.panY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.targetZ = ((this.maxRank * this.depthScale) / 2) * this.baseScale;
    this.distance = Math.max(this.width, this.height) * 1.5;
    this.canvas.focus({ preventScroll: true });
    this.loop();
    this.animateCamera(0.58, 0.48, 750, () => {this.fitToGraph();this.onViewChange?.();});
  }

  getViewState() {
    const dimension=Math.max(this.width,this.height,1);
    return {
      yaw:this.animation?.yawTo??this.yaw,pitch:this.animation?.pitchTo??this.pitch,distanceRatio:this.distance/dimension,
      targetX:this.targetX/this.baseScale,targetY:this.targetY/this.baseScale,targetZ:this.targetZ/this.baseScale,
      panXRatio:this.panX/this.width,panYRatio:this.panY/this.height
    };
  }

  restoreViewState(state) {
    if(!state)return this.enter3D();
    this.enabled=true;this.paused=false;
    const dimension=Math.max(this.width,this.height,1);
    const value=(x,fallback)=>Number.isFinite(Number(x))?Number(x):fallback;
    this.yaw=value(state.yaw,.58);this.pitch=value(state.pitch,.48);
    this.distance=Math.max(480,Math.min(9000,value(state.distanceRatio,1.5)*dimension));
    this.targetX=value(state.targetX,0)*this.baseScale;
    this.targetY=value(state.targetY,0)*this.baseScale;
    this.targetZ=value(state.targetZ,0)*this.baseScale;
    this.panX=value(state.panXRatio,0)*this.width;
    this.panY=value(state.panYRatio,0)*this.height;
    this.loop();
  }

  fitToGraph() {
    if (!this.nodes.length) return;
    this.panX = 0;
    this.panY = 0;
    const points = this.nodes.map((node) => this.project(node));
    const minX = Math.min(...points.map((p) => p.x)), maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y)), maxY = Math.max(...points.map((p) => p.y));
    const width = Math.max(1, maxX - minX), height = Math.max(1, maxY - minY);
    const fit = Math.max(0.25, Math.min(1.15, (this.width - 190) / width, (this.height - 150) / height));
    this.distance /= fit;
    const fitted = this.nodes.map((node) => this.project(node));
    const left = Math.min(...fitted.map((p) => p.x)), right = Math.max(...fitted.map((p) => p.x));
    const top = Math.min(...fitted.map((p) => p.y)), bottom = Math.max(...fitted.map((p) => p.y));
    this.panX += this.width / 2 - (left + right) / 2;
    this.panY += this.height / 2 - (top + bottom) / 2;
  }

  exit3D(onDone) {
    this.animateCamera(0, 0, 450, () => {
      this.enabled = false;
      this.paused = false;
      cancelAnimationFrame(this.frame);
      this.tooltip.style.display = "none";
      onDone?.();
    });
  }

  pause() {
    if (!this.enabled || this.paused) return;
    this.paused = true;
    cancelAnimationFrame(this.frame);
  }

  resume() {
    if (!this.enabled || !this.paused) return;
    this.paused = false;
    this.frame = requestAnimationFrame((time) => this.loop(time));
  }

  zoomBy(factor) {
    this.distance = Math.max(480, Math.min(9000, this.distance * factor));
    this.onViewChange?.();
  }

  setSelection(id, prerequisites = [], extensions = []) {
    this.selectedID = id;
    this.prerequisites = prerequisites;
    this.extensions = extensions;
  }

  setSearch(query) { this.query = query.trim().toLocaleLowerCase(); }

  setHover(id) {
    if (this.hoveredID === id) return;
    this.hoveredID = id;
    if (!id) this.tooltip.style.display = "none";
  }

  loop(now = 0) {
    if (!this.enabled || this.paused) return;
    if (this.animation) {
      const a = this.animation;
      const t = Math.min(1, (now - a.start) / a.duration);
      const ease = t * t * (3 - 2 * t);
      this.yaw = a.yaw + (a.yawTo - a.yaw) * ease;
      this.pitch = a.pitch + (a.pitchTo - a.pitch) * ease;
      if (t >= 1) {
        this.animation = null;
        a.onDone?.();
      }
    }
    this.draw();
    this.frame = requestAnimationFrame((time) => this.loop(time));
  }

  project(node) {
    const x = (node.x - this.layoutWidth / 2) * this.baseScale - this.targetX;
    const y = (node.y - this.layoutHeight / 2) * this.baseScale - this.targetY;
    const z = ((this.ranks[node.id] ?? 0) - this.maxRank / 2) * this.depthScale * this.baseScale - this.targetZ;
    const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const x1 = x * cy - z * sy;
    const z1 = x * sy + z * cy;
    const y1 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    const depth = Math.max(160, this.distance - z2);
    const focal = Math.max(this.width, this.height) * 1.3;
    const scale = focal / depth;
    return {
      x: this.width / 2 + this.panX + x1 * scale,
      y: this.height / 2 + this.panY + y1 * scale,
      depth,
      scale,
      radius: Math.max(4.5, Math.min(13, 7.2 * scale + 2))
    };
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    const gradient = ctx.createRadialGradient(this.width * 0.48, this.height * 0.42, 10, this.width * 0.5, this.height * 0.5, Math.max(this.width, this.height));
    gradient.addColorStop(0, "#142b3c");
    gradient.addColorStop(1, "#07131f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    const projected = new Map(this.nodes.map((node) => [node.id, { node, ...this.project(node) }]));
    this.projected = [...projected.values()];
    this.drawEdges(ctx, projected);
    this.drawEntryIndicator(ctx, projected);
    const ordered = [...projected.values()].sort((a, b) => b.depth - a.depth);
    this.labelBoxes = [];
    for (const point of ordered) this.drawNode(ctx, point);
    this.drawHud(ctx);
  }

  drawEdges(ctx, projected) {
    for (const edge of this.edges) {
      const a = projected.get(edge.from), b = projected.get(edge.to);
      if (!a || !b) continue;
      const related = edge.kind === "related";
      const active = (this.selectedID && ((edge.from === this.selectedID && this.extensions.includes(edge.to)) ||
        (edge.to === this.selectedID && this.prerequisites.includes(edge.from)))) ||
        (this.hoveredID && (edge.from === this.hoveredID || edge.to === this.hoveredID));
      const dim = this.query && !edge.from.toLowerCase().includes(this.query) && !edge.to.toLowerCase().includes(this.query);
      ctx.save();
      ctx.globalAlpha = dim ? 0.035 : active ? 0.95 : related ? 0.34 : 0.48;
      ctx.strokeStyle = active ? "#73e3d1" : related ? "#90a9bc" : "#76a5b8";
      ctx.lineWidth = active ? 2 : 1;
      ctx.setLineDash(related ? [5, 5] : []);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const len = active ? 7 : 5;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - len * Math.cos(angle - 0.45), b.y - len * Math.sin(angle - 0.45));
      ctx.lineTo(b.x - len * Math.cos(angle + 0.45), b.y - len * Math.sin(angle + 0.45));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  drawNode(ctx, point) {
    const { node, x, y, radius, depth, scale } = point;
    if (x < -100 || x > this.width + 100 || y < -100 || y > this.height + 100) return;
    const related = node.id === this.selectedID || this.prerequisites.includes(node.id) ||
      this.extensions.includes(node.id) || node.id === this.hoveredID;
    const match = !this.query || node.title.toLocaleLowerCase().includes(this.query) ||
      node.en.toLocaleLowerCase().includes(this.query) || node.id.toLowerCase().includes(this.query);
    const dim = !match || (this.selectedID && !related);
    const color = this.groupMeta[node.group]?.color ?? "#8cb4c0";
    ctx.save();
    ctx.globalAlpha = dim ? 0.12 : Math.max(0.5, Math.min(1, 1.05 - depth / (this.distance * 4)));
    if (related) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 17;
    }
    const sphere = ctx.createRadialGradient(x - radius * 0.36, y - radius * 0.42, 1, x, y, radius * 1.25);
    sphere.addColorStop(0, "#ffffff");
    sphere.addColorStop(0.18, color);
    sphere.addColorStop(1, "#07131f");
    ctx.fillStyle = sphere;
    ctx.beginPath();
    ctx.arc(x, y, radius + (related ? 1.5 : 0), 0, Math.PI * 2);
    ctx.fill();
    if(node.entryPoint){
      ctx.strokeStyle="#ffd27a";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,radius+5,0,Math.PI*2);ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.strokeStyle = related ? "#e7fff9" : "#ffffffa0";
    ctx.lineWidth = related ? 1.5 : 0.8;
    ctx.stroke();
    const fontSize = Math.max(9, Math.min(12, 10.5 * scale));
    ctx.font = `${node.id === this.selectedID ? "700" : "500"} ${fontSize}px "Segoe UI","Microsoft YaHei",sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = dim ? "#b5c5cc" : (node.contentStatus === "complete" ? "#eef7f7" : "#ffb3a3");
    ctx.shadowColor = "#06111bcc";
    ctx.shadowBlur = 4;
    const labelX = x + radius + 5, labelY = y;
    const labelWidth = ctx.measureText(node.title).width;
    const box = { x: labelX - 2, y: labelY - fontSize / 2 - 2, w: labelWidth + 4, h: fontSize + 4 };
    const overlaps = this.labelBoxes.some((b) => box.x < b.x + b.w + 4 && box.x + box.w + 4 > b.x && box.y < b.y + b.h + 3 && box.y + box.h + 3 > b.y);
    if (related || !overlaps) {
      ctx.fillText(node.title, labelX, labelY);
      this.labelBoxes.push(box);
    }
    ctx.restore();
  }

  drawEntryIndicator(ctx,projected){
    const point=projected.get(this.nodes.find(node=>node.entryPoint)?.id);
    if(!point)return;
    const x1=point.x-point.radius-52,x2=point.x-point.radius-5,y=point.y;
    ctx.save();ctx.strokeStyle="#ffd27a";ctx.fillStyle="#ffe0a0";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x2,y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x2,y);ctx.lineTo(x2-7,y-4);ctx.lineTo(x2-7,y+4);ctx.closePath();ctx.fill();
    ctx.font='700 10px "Segoe UI","Microsoft YaHei",sans-serif';ctx.textAlign="right";ctx.textBaseline="bottom";
    ctx.fillText("从这里开始",x1-3,y-6);ctx.restore();
  }

  drawHud(ctx) {
    ctx.save();
    ctx.font = '11px "Segoe UI","Microsoft YaHei",sans-serif';
    ctx.fillStyle = "#c3d6dc";
    ctx.fillText("3D 知识图谱 · WASD 移动 · Q/E 升降 · 拖动旋转 · 滚轮缩放", 18, this.height - 18);
    ctx.restore();
  }

  hitTest(x, y) {
    let best = null, min = Infinity;
    for (const point of this.projected) {
      const d = Math.hypot(x - point.x, y - point.y);
      const limit = Math.max(12, point.radius + 5);
      if (d < limit && d < min) { min = d; best = point; }
    }
    return best;
  }

  updateHover(x, y, clientX, clientY) {
    const hit = this.hitTest(x, y);
    this.setHover(hit?.node.id ?? null);
    if (!hit) return;
    const meta = this.groupMeta[hit.node.group];
    this.tooltip.replaceChildren();
    const title = document.createElement("b");
    title.textContent = hit.node.title;
    const domain = document.createElement("span");
    domain.textContent = `${meta?.label ?? ""} · ${hit.node.book}`;
    this.tooltip.append(title, domain);
    const box = this.viewport.getBoundingClientRect();
    this.tooltip.style.left = `${clientX - box.left}px`;
    this.tooltip.style.top = `${clientY - box.top}px`;
    this.tooltip.style.display = "block";
  }
}
