
  
import Phaser from "phaser";
import collidable from "../mixins/collidable";

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    Object.assign(this, collidable);

    this.init();
    this.initEvents();
  }

  init() {
    this.gravity = 500;
    this.speed = 25;
    this.timeFromLastTurn = 0;
    this.platformCollidersLayer = null;
    this.rayGraphics = this.scene.add.graphics({lineStyle: {width: 2, color: 0xaa0aa}})

    this.body.setGravityY(this.gravity);

    //adjust later once map done
    this.setSize(30, 110);
    this.setDisplaySize(150, 150);
    this.setOffset(100, 55);

    this.setVelocityX(this.speed = -this.speed)
    
    this.setCollideWorldBounds(true);
    //adjust later once map done
    this.setImmovable(true);

    this.setOrigin(0.5, 1);
  }

  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this)
  }

  update(time, delta) {
    
    const { ray, hasHit } = this.raycast(this.body, this.platformCollidersLayer, 30, 1);

    if (!hasHit && this.timeFromLastTurn + 100 < true) {
       this.setFlipX(!this.flipX)
       this.setVelocityX(this.speed = -this.speed)
       this.timeFromLastTurn = time;
    }

    this.rayGraphics.clear();
    this.rayGraphics.strokeLineShape(ray);

  }


  setPlatformColliders(platformCollidersLayer) {
    this.platformCollidersLayer = platformCollidersLayer;
  }

 
}

export default Enemy;