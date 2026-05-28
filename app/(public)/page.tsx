'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Palette, Layers, Globe, ShieldCheck, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import * as THREE from 'three';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface Partner {
  id: string;
  name: string;
}

const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Sarah Jenkins',
    role: 'Art Director',
    content: 'The Spot Matching System has completely eliminated the guesswork from our brand color management. Consistency across digital and print is finally achievable.',
    rating: 5
  },
  {
    id: 't2',
    name: 'Marcus Thorne',
    role: 'Print Buyer',
    content: 'We deployed SMS across our global supply chain. The reduction in proofing cycles and material waste has yielded an incredible ROI within months.',
    rating: 5
  },
  {
    id: 't3',
    name: 'Elena Rostova',
    role: 'Lead Designer',
    content: 'Predictability is everything. Spot-Nordic gives us the tools to ensure our creative vision is translated perfectly, regardless of the substrate or printing method.',
    rating: 5
  },
  {
    id: 't4',
    name: 'David Chen',
    role: 'Packaging Specialist',
    content: 'SMS READY standards have streamlined our prepress operations. We no longer spend hours tweaking curves to hit brand colors. It just works.',
    rating: 5
  },
  {
    id: 't5',
    name: 'Anna Schmidt',
    role: 'Brand Manager',
    content: 'Maintaining our brand identity globally used to be a nightmare. With the Spot Matching System, we have a unified language for color that all our vendors understand.',
    rating: 5
  }
];

const partners: Partner[] = [
  { id: 'p1', name: 'CEC Brasil' },
  { id: 'p2', name: 'SMS Experts Gulf' },
  { id: 'p3', name: 'ISO 12647 Standard' },
  { id: 'p4', name: 'G7 Certified' },
  { id: 'p5', name: 'Spot-Nordic Global' },
  { id: 'p6', name: 'Print Verify Pro' },
  { id: 'p7', name: 'Color Logic Systems' },
  { id: 'p8', name: 'Nordic Brand Consortium' }
];

export default function HomePage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !labelsRef.current) return;

    mountRef.current.innerHTML = '';
    labelsRef.current.innerHTML = '';

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const particleCount = 2500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const hexCodes: string[] = [];

    const colorPalette = [
      new THREE.Color('#D85456'),
      new THREE.Color('#3D3737'),
      new THREE.Color('#4B4846'),
      new THREE.Color('#2C5282'),
      new THREE.Color('#38A169'),
      new THREE.Color('#D69E2E')
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = 50 + Math.random() * 800;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const baseColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;

      hexCodes.push('#' + baseColor.getHexString().toUpperCase());
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const MAX_LABELS = 6;
    const labelPool = Array.from({ length: MAX_LABELS }).map(() => {
      const el = document.createElement('div');
      el.className = 'absolute px-3 py-1.5 bg-background/90 backdrop-blur-md border border-border text-foreground text-[10px] font-mono font-bold rounded-lg shadow-xl pointer-events-none transition-opacity duration-1000 opacity-0 transform -translate-x-1/2 -translate-y-full flex items-center gap-2';
      el.style.display = 'none';
      
      const dot = document.createElement('div');
      dot.className = 'w-2 h-2 rounded-full shadow-sm';
      
      const textNode = document.createTextNode('');
      
      el.appendChild(dot);
      el.appendChild(textNode);
      labelsRef.current?.appendChild(el);
      
      return { el, dot, textNode, active: false, index: -1, expiry: 0 };
    });

    let reqId: number;
    const clock = new THREE.Clock();
    let lastSpawn = 0;
    const vector = new THREE.Vector3();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      particles.rotation.y += 0.04 * delta;
      particles.rotation.x += 0.01 * delta;
      particles.updateMatrixWorld();

      if (elapsed - lastSpawn > 1.2) {
        const freeLabel = labelPool.find(p => !p.active);
        if (freeLabel) {
          const randIdx = Math.floor(Math.random() * particleCount);
          freeLabel.active = true;
          freeLabel.index = randIdx;
          freeLabel.expiry = elapsed + 4.5;
          
          const activeHex = hexCodes[randIdx];
          freeLabel.textNode.nodeValue = activeHex;
          freeLabel.dot.style.backgroundColor = activeHex;
          freeLabel.el.style.boxShadow = `0 0 15px ${activeHex}60`;
          freeLabel.el.style.display = 'flex';
          
          void freeLabel.el.offsetWidth;
          freeLabel.el.style.opacity = '1';
          lastSpawn = elapsed;
        }
      }

      for (let i = 0; i < MAX_LABELS; i++) {
        const p = labelPool[i];
        if (!p.active) continue;

        if (elapsed > p.expiry) {
          p.el.style.opacity = '0';
          if (elapsed > p.expiry + 1.0) {
            p.active = false;
            p.el.style.display = 'none';
          }
          continue;
        }

        vector.set(
          positions[p.index * 3],
          positions[p.index * 3 + 1],
          positions[p.index * 3 + 2]
        );
        
        vector.applyMatrix4(particles.matrixWorld);
        vector.project(camera);

        if (vector.z > 1 || vector.z < -1) {
          p.el.style.opacity = '0';
        } else {
          const x = (vector.x * 0.5 + 0.5) * width;
          const y = (vector.y * -0.5 + 0.5) * height;
          p.el.style.left = `${x}px`;
          p.el.style.top = `${y - 12}px`;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
      if (labelsRef.current) labelsRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
      
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden border-b border-border bg-background transition-colors duration-300">
        <div ref={mountRef} className="absolute inset-0 z-0"></div>
        <div ref={labelsRef} className="absolute inset-0 z-10 pointer-events-none overflow-hidden"></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-10 pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center mt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-secondary-foreground text-xs font-semibold mb-8 backdrop-blur-md shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D85456] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D85456]"></span>
            </span>
            Spot Matching System®
          </div>
          
          <h1 className="text-5xl md:text-[5.5rem] font-extrabold tracking-tighter mb-6 text-foreground max-w-5xl leading-[1.05] drop-shadow-2xl">
            Absolute Predictability In <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D85456] via-[#D69E2E] to-[#2C5282]">Color Reproduction</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-10 font-medium drop-shadow-md">
            The global standard for brand color management, print buying, and graphic design. ISO 12647 and G7 compliant frameworks built for the modern creator.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop" className="bg-[#D85456] text-white px-8 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#D85456]/90 transition-all shadow-xl hover:-translate-y-0.5 border border-[#D85456]">
              Shop SMS Products <ArrowRight size={18} />
            </Link>
            <Link href="/docs" className="bg-secondary text-secondary-foreground backdrop-blur-md border border-border px-8 py-3.5 rounded-lg font-semibold hover:bg-secondary/80 transition-all flex items-center justify-center">
              Read Technical Documentation
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 border-b border-border bg-card overflow-hidden relative">
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-card to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-card to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex w-[200%] animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
          {[...partners, ...partners, ...partners].map((partner, idx) => (
            <div key={`${partner.id}-${idx}`} className="flex-1 min-w-[250px] flex items-center justify-center px-8 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <span className="text-xl font-black tracking-tight uppercase text-foreground">{partner.name}</span>
            </div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
        `}} />
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-6">The Unified Language of Color</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Spot-Nordic provides the definitive infrastructure for ensuring that the colors you specify on screen are exactly what appears in the final physical product. Our SMS READY methodologies bridge the gap between creative intent and manufacturing reality.
              </p>
              
              <ul className="space-y-5">
                {[
                  'Eliminate costly proofing cycles and revisions',
                  'Guarantee consistency across diverse substrates',
                  'Align seamlessly with ISO 12647 and G7 workflows',
                  'Empower print buyers with verifiable metrics'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="text-[#D85456] mt-1 shrink-0" size={20} />
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-10">
                <Link href="/services" className="inline-flex items-center text-[#D85456] font-bold hover:text-[#D85456]/80 transition-colors group">
                  Explore our methodology 
                  <ChevronRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Palette size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Graphic Design</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start your creative process with calibrated palettes that guarantee accurate reproduction down the line.
                </p>
              </div>
              <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow sm:translate-y-8">
                <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-xl flex items-center justify-center mb-6">
                  <Layers size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Print Buyers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Take control of your supply chain with objective parameters. Expect exactly what you ordered.
                </p>
              </div>
              <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center mb-6">
                  <Globe size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Brand Owners</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Protect your visual identity globally. Ensure your flagship colors remain pristine across all markets.
                </p>
              </div>
              <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow sm:translate-y-8">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Advertising Agencies</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Deliver campaigns with confidence. Secure client trust through flawless execution and standards compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-card border-y border-border overflow-hidden relative">
        <div className="container mx-auto px-6 mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Trusted by Industry Leaders</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how the Spot Matching System is revolutionizing workflows for professionals across the globe.
          </p>
        </div>

        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-card to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-card to-transparent z-10 pointer-events-none"></div>

        <div className="flex w-[300%] animate-[marquee_50s_linear_infinite] hover:[animation-play-state:paused] gap-6 px-6">
          {[...testimonials, ...testimonials, ...testimonials].map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="w-[400px] bg-background border border-border p-8 rounded-2xl shadow-sm shrink-0 flex flex-col justify-between">
              <div>
                <div className="flex text-[#D69E2E] mb-4">
                  {[...Array(item.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-foreground leading-relaxed font-medium mb-6">"{item.content}"</p>
              </div>
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-[#D85456]/20 text-[#D85456] flex items-center justify-center font-bold">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 max-w-3xl leading-tight text-primary-foreground">
            Ready to Standardize Your Color Workflow?
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mb-12">
            Join the global network of SMS READY professionals. Equip your team with the tools to achieve total color predictability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop" className="bg-background text-primary px-10 py-4 rounded-lg font-bold hover:scale-105 transition-transform shadow-xl">
              Browse Store
            </Link>
            <Link href="/contact" className="bg-transparent border border-primary-foreground/50 text-primary-foreground px-10 py-4 rounded-lg font-bold hover:bg-primary-foreground/10 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}