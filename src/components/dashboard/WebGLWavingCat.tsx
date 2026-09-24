"use client";

import { useRef, useEffect } from "react";
import { Application, Sprite, Assets } from "pixi.js";

interface WebGLWavingCatProps {
  className?: string;
}

export function WebGLWavingCat({ className = "" }: WebGLWavingCatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;
    const container = containerRef.current;

    async function initPixi() {
      const app = new Application();

      await app.init({
        backgroundAlpha: 0,
        width: 100,
        height: 100,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
      });

      if (destroyed) {
        app.destroy(true, { children: true, texture: true });
        return;
      }

      appRef.current = app;
      container.appendChild(app.canvas as HTMLCanvasElement);

      // Load assets
      const bodyTexture = await Assets.load("/assets/cat-body.png");
      const pawTexture = await Assets.load("/assets/cat-paw.png");

      if (destroyed) return;

      // Create body sprite
      const bodySprite = new Sprite(bodyTexture);
      bodySprite.anchor.set(0.5, 0.5);
      bodySprite.x = 50;
      bodySprite.y = 50;
      // Scale to fit the 100x100 canvas
      const bodyScale = Math.min(80 / bodyTexture.width, 90 / bodyTexture.height);
      bodySprite.scale.set(bodyScale);

      // Create paw sprite
      const pawSprite = new Sprite(pawTexture);
      pawSprite.anchor.set(0.1, 0.9);
      // Position at the cat's shoulder area (top-right of body)
      pawSprite.x = bodySprite.x + 10;
      pawSprite.y = bodySprite.y - 15;
      const pawScale = Math.min(30 / pawTexture.width, 30 / pawTexture.height);
      pawSprite.scale.set(pawScale);

      app.stage.addChild(bodySprite);
      app.stage.addChild(pawSprite);

      // Animation state
      let elapsed = 0;
      let waveSpeed = 3; // base oscillation speed
      const targetSpeed = { value: 3 };

      // Enable interactivity on stage
      app.stage.eventMode = "static";
      app.stage.hitArea = app.screen;

      app.stage.on("pointerenter", () => {
        targetSpeed.value = 10; // wave faster on hover
      });

      app.stage.on("pointerleave", () => {
        targetSpeed.value = 3; // return to normal
      });

      // The Render Loop
      app.ticker.add((ticker) => {
        // Smoothly lerp the wave speed toward target
        waveSpeed += (targetSpeed.value - waveSpeed) * 0.05;
        elapsed += ticker.deltaTime * 0.02;

        // Trigonometric waving motion
        pawSprite.rotation = Math.sin(elapsed * waveSpeed) * 0.4;

        // Subtle body bob for added life
        bodySprite.y = 50 + Math.sin(elapsed * 1.5) * 1.5;
      });
    }

    initPixi().catch(console.error);

    // Cleanup — prevent WebGL memory leaks
    return () => {
      destroyed = true;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      style={{ pointerEvents: "auto" }}
    />
  );
}
