import Phaser from "phaser";
import initializeAnimations from "./Animations/PlayerAnimation";
import collidable from "../mixins/collidable";
import HealthBar from "../hud/HealthBar";
import Projectiles from "../attacks/Projectiles";
import anims from '../mixins/anims';
import EventEmitter from "../events/Emitter";

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    //Mixins
    Object.assign(this, collidable);
    Object.assign(this, anims);

    this.init();
    this.initEvents();
  }

  init() {
    this.gravity = 500;
    this.playerSpeed = 150;
    this.jumpCount = 0;
    this.consecutiveJumps = 1;
    this.hasBeenHit = false;
    this.bounceVelocity = 250;
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.jumpSound = this.scene.sound.add('jump', {volume: 0.2});
    // this.projectileSound = this.scene.sound.add('projectile-launch', {volume: 0.2});
    this.jumpSound = this.scene.sound.add('step', {volume: 0.2});
    // this.swipeSound = this.scene.sound.add('swipe', {volume: 0.2});

    this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
    this.projectiles = new Projectiles(this.scene);

    //healthbar
    // this.health = 100;
    this.health = 100;
    this.hp = new HealthBar(
      this.scene,
      this.scene.config.leftTopCorner.x + 5,
      this.scene.config.leftTopCorner.y + 5,
      2,
      this.health
    )
    this.body.setSize(20, 37);
    this.setDisplaySize(50, 37);
    this.body.setGravityY(this.gravity);
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 1);

    initializeAnimations(this.scene.anims);

    // add button for firing the projectiles
    this.scene.input.keyboard.on('keydown-Q', () => {
      this.play('idle', true);
      // this.projectileSound.play();
      this.projectiles.fireProjectile(this);
    })
//sound effect when running
    // this.scene.time.addEvent({
    //   delay: 350,
    //   repeat: -1,
    //   callbackScope: this,
    //   callback: () => {
    //     if (this.isPlayingAnims('run')) {
    //       this.stepSound.play();
    //     }
    //   }
    // })
  
  }

  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update() {
    if (this.hasBeenHit || !this.body) { return; }

    if (this.getBounds().top > this.scene.config.height) {
      EventEmitter.emit('PLAYER_LOSE');
      return;
    }

    const { left, right, space, up } = this.cursors;
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
    const onFloor = this.body.onFloor();

    if (left.isDown) {
      this.lastDirection = Phaser.Physics.Arcade.FACING_LEFT;
      this.setVelocityX(-this.playerSpeed);
      this.setFlipX(true);
    } else if (right.isDown) {
      this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
      this.setVelocityX(this.playerSpeed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    if (
      isSpaceJustDown &&
      (onFloor || this.jumpCount < this.consecutiveJumps)) {
      this.jumpSound.play();
      this.setVelocityY(-this.playerSpeed * 2);
      this.jumpCount++;
    }
    if (onFloor) {
      this.jumpCount = 0;
    }

    // if (this.isPlayingAnims('idle')) {
    //   return;
    // }


    onFloor
      ? this.body.velocity.x !== 0
        ? this.play("run", true)
        : this.play("idle", true)
      : this.play("jump", true);
  }

  playDamageTween() {
    return this.scene.tweens.add({
      targets: this,
      duration: 100,
      repeat: -1,
      tint: 0xffffff,
    });
  }

  bounceOff(initiator) {


    if (initiator.body) {
      this.body.touching.right
      ? this.setVelocityX(-this.bounceVelocity)
      : this.setVelocityX(this.bounceVelocity);
    } else {
      this.body.blocked.right
      ? this.setVelocityX(-this.bounceVelocity)
      : this.setVelocityX(this.bounceVelocity);
    }
    

    setTimeout(() => this.setVelocityY(-this.bounceVelocity), 0);
  }

  takesHit(initiator) {
    if (this.hasBeenHit) { return; }
     
    this.health -= initiator.damage || initiator.properties.damage || 0;
    if (this.health <= 0) {
      EventEmitter.emit('PLAYER_LOSE');
      return;
    }


    this.hasBeenHit = true;
    this.bounceOff(initiator);
    const hitAnim = this.playDamageTween();

    
    this.hp.decrease(this.health);

    this.scene.time.delayedCall(1000, () => {
      this.hasBeenHit = false;
      hitAnim.stop();
      this.clearTint();
    });

    // this.scene.time.addEvent({
    //   delay: 1000,
    //   callback:  () => {
    //     this.hasBeenHit = false;
    //   },
    //   loop: false
    // })
  }

  
}

export default Player;