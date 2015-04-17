/**
 * ゲームメイン。
 * 
 * @author 2014/08 matsushima
 */

#pragma strict

/** ゲーム状態: 開始 */
static var STATE_START:int = 0;
/** ゲーム状態: ゲーム中 */
static var STATE_RUNNING:int = 1;
/** ゲーム状態: 勝ち */
static var STATE_WIN:int = 2;
/** ゲーム状態: 負け */
static var STATE_LOSE:int = 3;

/** ゲーム状態 */
static var state:int = STATE_START; // ゲーム状態: 開始
/** デバッグテキスト */
static var debugTexts:Hashtable = new Hashtable();
/** プレーヤー */
var player:Transform;
/** 対戦相手 */
var other:Transform;
/** テキストラベル */
var label:Transform;

function Start () {

}

function Update () {
	switch (state) {
	case STATE_START: // ゲーム状態: 開始
		label.GetComponent.<GUIText>().text = "START";
		label.GetComponent.<GUIText>().enabled = true;
		break;
	case STATE_RUNNING: // ゲーム状態: ゲーム中
		break;
	case STATE_WIN: // ゲーム状態: 勝ち
		label.GetComponent.<GUIText>().text = "YOU WIN";
		label.GetComponent.<GUIText>().enabled = true;
		break;
	case STATE_LOSE: // ゲーム状態: 負け
		label.GetComponent.<GUIText>().text = "WIN LOSE";
		label.GetComponent.<GUIText>().enabled = true;
		break;
	}
	// click or touch start
	if (label.GetComponent.<GUIText>().enabled) {
		if (Input.GetMouseButtonUp(0)
				|| (Input.touchCount > 0) && (TouchPhase.Ended == Input.GetTouch(0).phase)) {
			state = STATE_RUNNING; // ゲーム状態: ゲーム中
			label.GetComponent.<GUIText>().enabled = false;
			player.GetComponent(cannonScript).Init();
			other.GetComponent(cannonScript).Init();
		}
	}
}

function OnGUI() {
	// デバッグテキスト表示
	var y:int = 0;
	for (var k:Object in debugTexts.Keys) {
		GUI.Label(Rect(0, y * 20, 400, 20), debugTexts[k].ToString());
		++ y;
	}
}

static function Log(key:String, text:Object) {
	// デバッグテキスト表示登録
//	debugTexts[key] = text;
	// デバッグテキストログ出力
//	print(text);
}
