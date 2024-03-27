import { _decorator, Component, Node, Sprite, SpriteFrame, Label, SkeletalAnimation, Skeleton, instantiate, UITransform, sp } from 'cc';
import { TileComponent } from './TileComponent';
const { ccclass, property } = _decorator;

@ccclass('GameBoard')
export class GameBoard extends Component {
    // Variable for setup game 
    @property width = 9;
    @property height = 9;
    @property numberMines = 1;

    @property({ type: [TileComponent] }) listTiles: TileComponent[] = [];
    @property({ type: [SpriteFrame] }) arrBlockLight: SpriteFrame[] = []; // Array Tiles Light
    @property({ type: [SpriteFrame] }) arrBlockDark: SpriteFrame[] = [];  // Array Tiles Dark
    @property({ type: [SpriteFrame] }) arrSpritesBombPlayer: SpriteFrame[] = []; // Array Sprites bomb player
    @property({ type: [SpriteFrame] }) arrSpritesBombEnemy: SpriteFrame[] = [];  // Array Sprites bomb enemy

    @property({ type: [Node] }) posContainTiles = null;
    @property({ type: [TileComponent] }) tilePref = null;

    @property({ type: sp.Skeleton }) skePlayer: sp.Skeleton | null = null;
    @property({ type: sp.Skeleton }) skeEnemy: sp.Skeleton | null = null;

    // Variable logic game 
    isContinue = false;
    isTurnPlayer = true;
    turnPlayer = 1;

    start() {
        this.SetIndexMap();
        this.SetupMines();
        this.SetupNumbers();

        this.ListenEvent();
        this.skePlayer.setAnimation(0, "Idle2", true);

    }

    // Listen event of all tiles
    ListenEvent() {
        for (var i = 0; i < this.listTiles.length; i++) {
            this.listTiles[i].tile.on("ClickTile", this.Emit_OpenTile, this);
        }
    }

    // HANDLE LOGIC GAME PLAY (ALL STATE MACHINE)
    Emit_OpenTile(x, y) {
        this.OpenTile(x,y);
        this.CheckEndGame();
    }

    OpenTile(x, y) {
        // console.log(x + ":" + y)
        var tile = this.GetTile(x, y);
        if (tile != null) {
            // console.log("Handle Open Tile");
            tile.img.getComponent(Sprite).spriteFrame = null;
            tile.isHide = false;
            // this.animPlayer.play("Idle2");
            if (tile.isMine) {
                // Change img Flag
                if (this.isTurnPlayer) {
                    tile.img.getComponent(Sprite).spriteFrame = this.arrSpritesBombPlayer[0];
                } else {
                    tile.img.getComponent(Sprite).spriteFrame = this.arrSpritesBombEnemy[0];
                }
                tile.img.getComponent(UITransform).setContentSize(40, 50);

                this.isContinue = true;
            } else {
                if (tile.numberMines == 0) {
                    this.OpenTileAroundZero(tile);
                } else {
                    tile.ShowNumberMinesAround();
                }
                this.isContinue = false;
            }
        } else {
            console.log("Tile = null");
        }
    }


    CheckEndGame() {
        if (this.isContinue) {
            // if(this.isTurnPlayer){
            //     this
            // }
        } else {
            // Delay 2s 
            this.ChangeTurn();

            if (!this.isTurnPlayer) {
                this.BotPlay();
            }
        }
    }

    NextTurn() {
        if (this.isContinue == false) {
            if (this.isTurnPlayer) {
                this.turnPlayer = 1;
            } else {
                this.turnPlayer = 2;
                // this.isTurnPlayer = this.isTurnPlayer;
            }
        }
    }

    ChangeTurn() {
        if (this.isTurnPlayer) {
            this.isTurnPlayer = false;
        } else {
            this.isTurnPlayer = true;
        }
    }

    OpenTileAroundZero(target) {
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                var tileAround = this.GetTile(target.posX + i, target.posY + j);
                if (tileAround != null) {
                    if (tileAround.isHide) {
                        this.OpenTile(tileAround.posX, tileAround.posY);
                    }
                }
            }
        }
    }

    BotPlay() {
        console.log("Bot play");
        var k = 0;
        var listTilesHide = [];
        for (var i = 0; i < this.listTiles.length; i++) {
            if (this.listTiles[i].isHide) {
                listTilesHide[k] = this.listTiles[i];
            }
            k++;
        }
        var random = this.GetRandomInt(0, listTilesHide.length);
        if (listTilesHide[random] != null) {
            this.OpenTile(listTilesHide[random].posX, listTilesHide[random].posY);
        }

        this.CheckEndGame();
    }

    /// ====== HANDLE LOGIC GAME BOARD (SETUP BOARD) ======= ///

    CreateMap() {
        for (var i = 0; i < this.width * this.height; i++) {
            var tile = instantiate(this.tilePref);
            tile.parent = this.posContainTiles;
        }
    }

    SetIndexMap() {
        for (var i = 0; i < this.listTiles.length; i++) {
            this.listTiles[i].posX = i % this.width;
            this.listTiles[i].posY = Math.trunc(i / this.height);
            this.listTiles[i].isHide = true;
            this.listTiles[i].text.getComponent(Label).string = "";

            if ((this.listTiles[i].posX + this.listTiles[i].posY) % 2 == 0) {
                var random = this.GetRandomInt(0, this.arrBlockLight.length);
                // console.log("random" + random);
                this.listTiles[i].img.getComponent(Sprite).spriteFrame = this.arrBlockLight[random];
            }
            else {
                var random = this.GetRandomInt(0, this.arrBlockDark.length);
                this.listTiles[i].getComponent(Sprite).spriteFrame = this.arrBlockDark[random];
            }
        }
    }

    SetupMines() {
        var numbMineCreate = 0;

        while (this.numberMines > numbMineCreate) {
            var posX = this.GetRandomInt(0, this.width);
            var posY = this.GetRandomInt(0, this.height);

            var tile = this.GetTile(posX, posY);
            if (tile != null) {
                if (!tile.isMine) {
                    tile.isMine = true;
                    numbMineCreate++;
                }
            }
        }
    }

    SetupNumbers() {
        for (var i = 0; i < this.listTiles.length; i++) {
            if (!this.listTiles[i].isMine) {
                this.CheckTilesAround(this.listTiles[i]);
            }
        }
    }

    CheckTilesAround(tile) {
        var numbMines = 0;
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                var tileAround = this.GetTile(tile.posX + i, tile.posY + j);
                if (tileAround != null) {
                    if (tileAround.isMine) {
                        numbMines++;
                    }
                }
            }
        }

        var tile2 = this.GetTile(tile.posX, tile.posY)
        if (tile2 != null) {
            tile2.SetNumberMines(numbMines);
        }
    }

    GetTile(posX, posY) {
        if (posX < 0 || posY < 0 || posX > (this.width - 1) || posY > (this.height - 1)) {
            return null;
        }
        else {
            return this.listTiles[posY * this.width + posX];
        }
    }

    GetListTileHide() {
        var arrTilesHide = null;
        for (var i = 0; i < this.listTiles.length; i++) {
            if (this.listTiles[i].isHide) {
                arrTilesHide.Add(this.listTiles[i]);
            }
            return arrTilesHide;
        }
    }

    GetRandomInt(min, max) {
        return Math.trunc(Math.random() * (max - min) + min);
    }
}