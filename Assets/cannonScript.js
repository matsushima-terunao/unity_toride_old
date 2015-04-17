/**
 * 砲台。
 * 
 * @author 2014/08 matsushima
 */

#pragma strict

var BALL_FORCE:float = 1800;

/** 砲弾 */
var ballPrefab:Transform;
/** 爆発 */
var particlePrefab:ParticleSystem;
/** 爆発 */
var particle:ParticleSystem = null;
/** 地形 */
var terrain:Terrain;

/** 砲弾存在 */
var ballExists:boolean = false;
/** 砲弾位置 */
var ballPosition:Vector3;

/** マウスボタン */
var mouseDown:boolean = false;
/** マウス位置 */
var mousePos:Vector3;
/** タッチ */
var touchDown:boolean = false;
/** タッチ位置 */
var touchPos:Vector3;

function Start () {

}

function Update () {
	if (MainScript.STATE_RUNNING != MainScript.state) { // not ゲーム状態: ゲーム中
		return;
	}
	var angleResolution:float = 180.0 / Mathf.Min(Screen.width, Screen.height); // 操作回転量: 画面短辺 -> 180度
	var distance:Vector3 = Vector3.zero; // 入力移動量
	var fire:boolean = false; // 発射
	if (gameObject.CompareTag("Player")) {
		// 自分
		// mouse drag: 移動量を求める
		var mousePosPrev:Vector3 = mousePos;
		mousePos = Input.mousePosition;
		if (mouseDown) {
			distance = mousePos - mousePosPrev;
		}
		// mouse down
		if (Input.GetMouseButtonDown(0)) {
			mouseDown = true;
		}
		// mouse up: 発射
		if (Input.GetMouseButtonUp(0)) {
			fire = mouseDown;
			mouseDown = false;
		}
		// touch swipe
		var touchPosPrev:Vector3 = touchPos;
		if (Input.touchCount > 0) {
			var touch = Input.GetTouch(0);
			switch (touch.phase) {
			// touch down
			case TouchPhase.Began:
				touchDown = true;
				touchPos = touch.position;
				break;
			// touch swipe: 移動量を求める
			case TouchPhase.Moved:
				touchPos = touch.position;
				distance = touchPos - touchPosPrev;
				break;
			// touch up: 発射
			case TouchPhase.Ended:
				fire = touchDown;
				touchDown = false;
				touchPos = touch.position;
				distance = touchPos - touchPosPrev;
				break;
			}
		}
		// mouse or touch 移動量 -> 回転
		// 縦方向: x軸回転
		// 横方向: y軸回転
		if (Vector3.zero != distance) {
			var angle:Vector3 = transform.eulerAngles - Vector3(distance.y, distance.x, 0) * angleResolution;
			angle.x = Mathf.Max(0, Mathf.Min(80, angle.x));
			angle.y = Mathf.Max(80, Mathf.Min(190, (angle.y + 180) % 360)); // -100..10
			angle.y = (angle.y + 180) % 360;
			transform.eulerAngles = angle;
			MainScript.Log("eulerAngles", "eulerAngles=" + angle + "," + transform.eulerAngles);
		}
	} else {
		// 相手
		if (!ballExists) { // not 砲弾存在
			var player:GameObject = GameObject.FindGameObjectWithTag("Player");
			// 横回転量 = (プレイヤーとの角度 - 砲弾との角度) / 2 + ランダム
			var playerAngle = Mathf.Atan2(
				player.transform.position.z - transform.position.z,
				player.transform.position.x - transform.position.x) * 180 / Mathf.PI;
			var ballAngle = Mathf.Atan2(
				ballPosition.z - transform.position.z,
				ballPosition.x - transform.position.x) * 180 / Mathf.PI;
			distance.y -= (playerAngle - ballAngle) / 2 + Random.value * 2 - 1;
			// 縦回転量 = (プレイヤーとの距離 - 砲弾との距離) / 10 + ランダム
			var magnitude:float
				= (player.transform.position - transform.position).magnitude
				- (ballPosition - transform.position).magnitude;
			distance.x += magnitude / 10 + Random.value * 2 - 1;
			// 回転
			transform.eulerAngles += Vector3(distance.x, distance.y, 0);
			// 発射。
			fire = true;
		}
	}
	// 発射。
	if (fire && !ballExists) {
		// 発射角度
		var y:float = Mathf.Cos(2 * Mathf.PI * transform.eulerAngles.x / 360);
		var r:float = Mathf.Sin(2 * Mathf.PI * transform.eulerAngles.x / 360);
		var x:float = r * Mathf.Sin(2 * Mathf.PI * transform.eulerAngles.y / 360);
		var z:float = r * Mathf.Cos(2 * Mathf.PI * transform.eulerAngles.y / 360);
		angle = Vector3(x, y, z);
		// インスタンスの生成
		var ball:Transform = Instantiate(ballPrefab, transform.FindChild("Cylinder").position + angle * 5, Quaternion.identity);
		ballExists = true;
		// 力を加える
		ball.GetComponent.<Rigidbody>().AddForce(angle * BALL_FORCE);
		MainScript.Log("AddForce", "AddForce=" + angle * BALL_FORCE + "," + (angle * BALL_FORCE).magnitude);
		// 発射元の砲台
		ball.GetComponent(ballScript).cannon = transform;
	}
}

function OnCollisionEnter(collision: Collision) {
	MainScript.Log("cannon collision", "cannon collision: " + collision.gameObject.name + "," + collision.contacts[0].point);
	if ("ball(Clone)" == collision.gameObject.name) {
	 	// 砲台非表示
		gameObject.SetActive(false);
		// 破壊エフェクト。
		// インスタンスの生成
		particle = Instantiate(particlePrefab, transform.position, Quaternion.identity);
		// 勝ち負け
		if (MainScript.STATE_RUNNING == MainScript.state) {
			MainScript.state = (gameObject.CompareTag("Player") ? MainScript.STATE_LOSE : MainScript.STATE_WIN);
		}
	}
}

/**
 * 初期化。
 */
function Init() {
	ballExists = false;
	mouseDown = false;
	touchDown = false;
	// 破壊エフェクト破棄
	if (null != particle) {
		Destroy(particle);
		particle = null;
	}
	// 砲台角度・位置
	if (gameObject.CompareTag("Player")) {
		// プレイヤー
		transform.eulerAngles = Vector3(45, 315, 0);
		transform.position.x = 90 - 20 * Random.value;
		transform.position.z = 10 + 20 * Random.value;
	} else {
		// 対戦相手
		transform.eulerAngles = Vector3(45, 135, 0);
		ballPosition = Vector3(100 * Random.value, 0, 100 * Random.value);
		transform.position.x = 10 + 20 * Random.value;
		transform.position.z = 90 - 20 * Random.value;
	}
	// 砲台の地形の高さ
	transform.position.y = terrain.terrainData.GetHeight(
		transform.position.x * terrain.terrainData.heightmapWidth / terrain.terrainData.size.x,
		transform.position.z * terrain.terrainData.heightmapHeight / terrain.terrainData.size.z)
		- transform.localScale.x;
	MainScript.Log("height", "height=" + transform.position.y);
 	// 砲台表示
	gameObject.SetActive(true);
}
