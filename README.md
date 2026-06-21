# 鑰佺帇鐨勭淮鎶ゅ疂

涓€涓熀浜?Electron + Vue 3 鐨勬闈㈠簲鐢ㄧ▼搴忥紝鎻愪緵鐢佃剳瀹氭椂浠诲姟鍜岀郴缁熺淮鎶ゅ姛鑳姐€?
## 涓嬭浇瀹夎

鍓嶅線 [Releases](https://github.com/wgg223/pc-manager/releases) 椤甸潰涓嬭浇鏈€鏂扮増鏈畨瑁呯▼搴忋€?
## 鍔熻兘鐗规€?
- **瀹氭椂浠诲姟**: 璁剧疆鐢佃剳瀹氭椂閲嶅惎銆佸叧鏈烘垨浼戠湢
- **纾佺洏娓呯悊**: 娓呯悊涓存椂鏂囦欢銆佺郴缁熺紦瀛樺拰鍥炴敹绔?- **绯荤粺淇℃伅**: 鏌ョ湅 CPU銆佸唴瀛樸€佺鐩樸€佹樉鍗°€佷富鏉跨瓑璇︾粏淇℃伅
- **杩涚▼绠＄悊**: 鏌ョ湅鍜岀鐞嗙郴缁熻繍琛岃繘绋?- **鍚姩椤圭鐞?*: 绠＄悊寮€鏈鸿嚜鍚姩绋嬪簭
- **缃戠粶閲嶇疆**: 閲嶇疆 DNS銆乄insock銆両P 鍦板潃
- **杞欢鍗歌浇**: 鏌ョ湅鍜屽嵏杞藉凡瀹夎杞欢
- **澹佺焊鏇存崲**: 璁剧疆妗岄潰澹佺焊
- **鑷畾涔夐〉闈?*: 鑷畾涔夊姛鑳藉崱鐗囧竷灞€
- **鎺у埗鍙?*: 鎵ц绯荤粺鍛戒护锛屾煡鐪嬪疄鏃惰緭鍑?
## 鎶€鏈爤

- Electron
- Vue 3
- Vite
- Element Plus
- systeminformation

## 寮€鍙?
```bash
npm install
npm run electron:dev
```

## 鎵撳寘

```bash
npm run electron:build
```

鎵撳寘鍚庣殑瀹夎绋嬪簭灏嗗湪 `build-output` 鐩綍涓€?
## 椤圭洰缁撴瀯

```
pc-manager/
鈹溾攢鈹€ electron/          # Electron 涓昏繘绋?鈹?  鈹溾攢鈹€ main.js       # 涓昏繘绋嬪叆鍙?鈹?  鈹斺攢鈹€ preload.js    # 棰勫姞杞借剼鏈?鈹溾攢鈹€ src/               # Vue 鍓嶇婧愮爜
鈹?  鈹溾攢鈹€ views/        # 椤甸潰缁勪欢
鈹?  鈹溾攢鈹€ router/       # 璺敱閰嶇疆
鈹?  鈹斺攢鈹€ main.js       # Vue 鍏ュ彛
鈹溾攢鈹€ package.json
鈹斺攢鈹€ vite.config.js
```

## 寮€婧愬崗璁?
MIT License
