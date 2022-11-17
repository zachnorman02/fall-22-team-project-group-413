import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class PollingArea extends Interactable {
  private _startPollText?: Phaser.GameObjects.Text;

  private _isInteracting = false;

  /* public get defaultVideoURL() {
    if (!this._defaultVideoURL) {
      return 'No URL found';
    }
    return this._defaultVideoURL;
  } */

  addedToScene() {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);

    // this._defaultVideoURL = this.getData('video');
    this._startPollText = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      `Press p to create a poll`,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._startPollText.setVisible(false);
    this.townController.getBinaryPollManagerController(this);
    this.setDepth(-1);
  }

  overlap(): void {
    if (!this._startPollText) {
      throw new Error('Should not be able to overlap with this interactable before added to scene');
    }
    const location = this.townController.ourPlayer.location;
    this._startPollText.setX(location.x);
    this._startPollText.setY(location.y);
    this._startPollText.setVisible(true);
  }

  overlapExit(): void {
    this._startPollText?.setVisible(false);
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
  }

  interact(): void {
    this._startPollText?.setVisible(false);
    this._isInteracting = true;
  }

  getType(): KnownInteractableTypes {
    return 'pollingArea';
  }
}
