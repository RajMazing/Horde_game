import Phaser from "phaser";
import initializeAnimations from "./Animations/PlayerAnimation.js";
import collidable from "../mixins/collidable";
import HealthBar from "../hud/HealthBar";
import Projectiles from "../attacks/Projectiles";
import Projectile from "../attacks/Projectile";

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    //Mixins
    Object.assign(this, collidable);

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
    this.projectiles = new Projectiles(this.scene);

    //healthbar
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
      console.log('pressing Q');
      this.projectiles.fireProjectile(this);
    })
  }

  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update() {
    if (this.hasBeenHit) {
      return;
    }
    const { left, right, space, up } = this.cursors;
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
    const onFloor = this.body.onFloor();

    if (left.isDown) {
      this.setVelocityX(-this.playerSpeed);
      this.setFlipX(true);
    } else if (right.isDown) {
      this.setVelocityX(this.playerSpeed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    if (
      isSpaceJustDown &&
      (onFloor || this.jumpCount < this.consecutiveJumps)
    ) {
      this.setVelocityY(-this.playerSpeed * 2);
      this.jumpCount++;
    }
    if (onFloor) {
      this.jumpCount = 0;
    }


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

  bounceOff() {
    this.body.touching.right
      ? this.setVelocityX(-this.bounceVelocity)
      : this.setVelocityX(this.bounceVelocity);

    setTimeout(() => this.setVelocityY(-this.bounceVelocity), 0);
  }

  takesHit(initiator) {
    if (this.hasBeenHit) {
      return;
    }
    this.hasBeenHit = true;
    this.bounceOff();
    const hitAnim = this.playDamageTween();

    this.health -= initiator.damage;
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