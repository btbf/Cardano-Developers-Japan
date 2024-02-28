# **ノードインストール(PreProdテストネット)**

## **1. 概要**

### 必要スペック

ネットワークにより必要要件が異なります。

=== "テストネット"
    | 項目      | 要件                          |
    | :---------- | :----------------------------------- |
    | **OS**       | 64-bit Linux \(Ubuntu 22.04 LTS\) |
    | **CPU**   | 2Ghz以上 2コアのIntelまたはAMD x86プロセッサー|
    | **メモリ**    | 16GB |
    | **ストレージ**    | 150GB |


=== "メインネット"
    | 項目      | 要件                          |
    | :---------- | :----------------------------------- |
    | **OS**       | 64-bit Linux \(Ubuntu 22.04 LTS\) |
    | **CPU**   | 2Ghz以上 2コアのIntelまたはAMD x86プロセッサー|
    | **メモリ**    | 24GB |
    | **ストレージ**    | 300GB |


!!! hint "インストールバージョン"
    | Node | CLI | GHC | Cabal |
    | :---------- | :---------- | :---------- | :---------- |
    | 8.7.3 | 8.17.0.0 | 8.10.7 | 3.8.1.0 | 

    * 最新のGHC/Cabalバージョンはcardano-node/cliのビルドに失敗するため必ず指定されたバージョンをインストールしてください。

## **2. 依存関係インストール**

新しいTMUXセッションを開く

```
tmux new -s build
```

Ubuntuを最新状態にします。
```bash
sudo apt update -y && sudo apt upgrade -y
```

必要なパッケージをインストールします
```bash
sudo apt install git jq bc automake tmux rsync htop curl build-essential pkg-config libffi-dev libgmp-dev libssl-dev libtinfo-dev libsystemd-dev zlib1g-dev make g++ wget libncursesw5 libtool autoconf liblmdb-dev -y
```

作業ディレクトリ作成
```
mkdir $HOME/git
```

### **Libsodium**

```bash
cd $HOME/git
git clone https://github.com/IntersectMBO/libsodium
cd libsodium
git checkout dbb48cc
./autogen.sh
./configure
make
sudo make install
```
> makeコマンド実行後半に出現する `warning` は無視して大丈夫です。

### **Secp256k1**

```
cd $HOME/git
git clone https://github.com/bitcoin-core/secp256k1.git
```

```
cd secp256k1/
git checkout ac83be33
./autogen.sh
./configure --prefix=/usr --enable-module-schnorrsig --enable-experimental
make
sudo make install
```

### **blst**

1.blstダウンロード
```bash
cd $HOME/git
git clone https://github.com/supranational/blst
cd blst
git checkout v0.3.10
./build.sh
```

2.設定ファイル作成
> このボックスはすべてコピーして実行してください

```text
cat > libblst.pc << EOF
prefix=/usr/local
exec_prefix=\${prefix}
libdir=\${exec_prefix}/lib
includedir=\${prefix}/include

Name: libblst
Description: Multilingual BLS12-381 signature library
URL: https://github.com/supranational/blst
Version: 0.3.10
Cflags: -I\${includedir}
Libs: -L\${libdir} -lblst
EOF
```

3.設定ファイルコピー
> このボックスは1行ずつコピーして実行してください

```bash
sudo cp libblst.pc /usr/local/lib/pkgconfig/
sudo cp bindings/blst_aux.h bindings/blst.h bindings/blst.hpp  /usr/local/include/
sudo cp libblst.a /usr/local/lib
sudo chmod u=rw,go=r /usr/local/{lib/{libblst.a,pkgconfig/libblst.pc},include/{blst.{h,hpp},blst_aux.h}}
```

### **GHCUP**
インストール変数設定
```bash
cd $HOME
BOOTSTRAP_HASKELL_NONINTERACTIVE=1
BOOTSTRAP_HASKELL_NO_UPGRADE=1
BOOTSTRAP_HASKELL_INSTALL_NO_STACK=yes
BOOTSTRAP_HASKELL_ADJUST_BASHRC=1
unset BOOTSTRAP_HASKELL_INSTALL_HLS
export BOOTSTRAP_HASKELL_NONINTERACTIVE BOOTSTRAP_HASKELL_INSTALL_STACK BOOTSTRAP_HASKELL_ADJUST_BASHRC
```

インストール
```bash
curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | bash
```


!!! attention "Cabal/GHCバージョンについて"
    最新バージョンはcardano-node/cliのビルドに失敗するため必ず以下で指定されたバージョンをインストールしてください。

cabalインストール
```bash
source ~/.bashrc
ghcup upgrade
ghcup install cabal 3.8.1.0
ghcup set cabal 3.8.1.0
```

GHCインストール

```bash
ghcup install ghc 8.10.7
ghcup set ghc 8.10.7
```

バージョン確認

```bash
cabal update
cabal --version
ghc --version
```

!!! check "チェック"
    Cabalバージョン：「3.8.1.0」  
    GHCバージョン：「8.10.7」であることを確認してください。


環境変数を設定しパスを通します。  
ノード設定ファイルは **$NODE\_HOME**(例：/home/user/cnode) に設定されます。

```bash
echo PATH="$HOME/.local/bin:$PATH" >> $HOME/.bashrc
echo export LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH" >> $HOME/.bashrc
echo export PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH" >> $HOME/.bashrc
echo export NODE_HOME=$HOME/cnode >> $HOME/.bashrc
```

環境変数に接続ネットワークを指定する(PreProdテストネット)
```bash
echo export NODE_CONFIG=preprod >> $HOME/.bashrc
echo export NODE_NETWORK='"--testnet-magic 1"' >> $HOME/.bashrc
echo export CARDANO_NODE_NETWORK_ID=1 >> $HOME/.bashrc
```

??? その他のネットワークの場合はこちら
    === "Preview(テストネット)"
        ```
        echo export NODE_CONFIG=preview >> $HOME/.bashrc
        echo export NODE_NETWORK='"--testnet-magic 2"' >> $HOME/.bashrc
        echo export CARDANO_NODE_NETWORK_ID=2 >> $HOME/.bashrc
        ```
    
    === "Mainnet(メインネット)"
        echo export NODE_CONFIG=mainnet >> $HOME/.bashrc
        echo export NODE_NETWORK='"--mainnet"' >> $HOME/.bashrc
        echo export CARDANO_NODE_NETWORK_ID=mainnet >> $HOME/.bashrc

bashrc再読み込み
```
source $HOME/.bashrc
```

## **3. ソースコードからビルド**

専用リポジトリからダウンロード
```bash
cd $HOME/git
git clone https://github.com/IntersectMBO/cardano-node.git
cd cardano-node
git fetch --all --recurse-submodules --tags
git checkout tags/8.7.3
```

Cabalのビルドオプションを構成します。

```bash
cabal clean
cabal update
cabal configure --with-compiler=ghc-8.10.7
```

カルダノノードをビルドします。

```sh
cabal build cardano-cli cardano-node
```

!!! info "ヒント"
    サーバスペックによって、ビルド完了までに数分から数時間かかる場合があります。


**cardano-cli**ファイルと **cardano-node**ファイルをbinディレクトリにコピーします。

```bash
sudo cp $(find $HOME/git/cardano-node/dist-newstyle/build -type f -name "cardano-cli") /usr/local/bin/cardano-cli
```
```bash
sudo cp $(find $HOME/git/cardano-node/dist-newstyle/build -type f -name "cardano-node") /usr/local/bin/cardano-node
```

**cardano-cli** と **cardano-node**のバージョンが最新Gitタグバージョンであることを確認してください。

```text
cardano-node version
cardano-cli version
```

以下の戻り値を確認する  
>cardano-cli 8.17.0.0 - linux-x86_64 - ghc-8.10  
git rev a4a8119b59b1fbb9a69c79e1e6900e91292161e7  

>cardano-node 8.7.3 - linux-x86_64 - ghc-8.10  
git rev a4a8119b59b1fbb9a69c79e1e6900e91292161e7  
  


TMUXセッションを閉じる

```
exit
```


## **4. ノード設定ファイルの修正**

ノード構成に必要な設定ファイルを取得します。  
config.json、genesis.json、topology.json

```bash
mkdir $NODE_HOME
cd $NODE_HOME
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/byron-genesis.json -O ${NODE_CONFIG}-byron-genesis.json
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/topology-legacy.json -O ${NODE_CONFIG}-topology.json
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/shelley-genesis.json -O ${NODE_CONFIG}-shelley-genesis.json
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/alonzo-genesis.json -O ${NODE_CONFIG}-alonzo-genesis.json
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/conway-genesis.json -O ${NODE_CONFIG}-conway-genesis.json
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/config.json -O ${NODE_CONFIG}-config.json
```

以下のコードを実行し **config.json**ファイルを更新します。  

設定ファイルを書き換える

```bash
sed -i ${NODE_CONFIG}-config.json \
    -e 's!"AlonzoGenesisFile": "alonzo-genesis.json"!"AlonzoGenesisFile": "'${NODE_CONFIG}'-alonzo-genesis.json"!' \
    -e 's!"ByronGenesisFile": "byron-genesis.json"!"ByronGenesisFile": "'${NODE_CONFIG}'-byron-genesis.json"!' \
    -e 's!"ShelleyGenesisFile": "shelley-genesis.json"!"ShelleyGenesisFile": "'${NODE_CONFIG}'-shelley-genesis.json"!' \
    -e 's!"ConwayGenesisFile": "conway-genesis.json"!"ConwayGenesisFile": "'${NODE_CONFIG}'-conway-genesis.json"!' \
    -e "s/TraceMempool\": false/TraceMempool\": true/g" \
    -e 's!"TraceBlockFetchDecisions": false!"TraceBlockFetchDecisions": true!' \
    -e 's!"rpKeepFilesNum": 10!"rpKeepFilesNum": 30!' \
    -e 's!"rpMaxAgeHours": 24!"rpMaxAgeHours": 48!' \
    -e '/"defaultScribes": \[/a\    \[\n      "FileSK",\n      "'${NODE_HOME}'/logs/node.json"\n    \],' \
    -e '/"setupScribes": \[/a\    \{\n      "scFormat": "ScJson",\n      "scKind": "FileSK",\n      "scName": "'${NODE_HOME}'/logs/node.json"\n    \},' \
    -e "s/127.0.0.1/0.0.0.0/g"
```

環境変数を追加し、.bashrcファイルを更新します。

```bash
echo export CARDANO_NODE_SOCKET_PATH="$NODE_HOME/db/socket" >> $HOME/.bashrc
source $HOME/.bashrc
```


## **5. オンチェーンDBダウンロード**

!!! hint "ミスリルプロトコルとは？"
    ミスリルはIOG研究論文[Mithril: Stake-based Threshold Multisignatures](https://iohk.io/en/research/library/papers/mithril-stake-based-threshold-multisignatures/)に基づいて開発されたマルチ署名プロトコルです。

    * 現時点ではステークプールオペレータがミスリルアグリゲーターが作成するスナップショットDBに署名することで、チェーンデータを保証します。
    * メインネットの場合、ノード初回起動時のDB同期時間を約2日から約30分以内にまで短縮できます。
    * スナップショットノードバージョンとサーバーノードバージョンが異なる場合、DB再構築処理が入る場合がありDB同期までに数時間かかります。


### **5-1.依存環境インストール**


```
sudo apt install -y libssl-dev build-essential m4 jq
```

### **5-2.Rustインストール**

RUST環境を準備します
```
mkdir $HOME/.cargo && mkdir $HOME/.cargo/bin
chown -R $USER $HOME/.cargo
touch $HOME/.profile
chown $USER $HOME/.profile
```

rustupインストール
```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
> 1) Proceed with installation (default) 1を入力してEnter

```
source $HOME/.cargo/env
```

```
rustup install stable
rustup default stable
rustup update
rustup component add clippy rustfmt
rustup target add x86_64-unknown-linux-musl
```

### **5-3.Mithril-Clientインストール**
```
cd $HOME/git
git clone https://github.com/input-output-hk/mithril.git
```

```
cd mithril
git fetch --all --prune
git checkout tags/2403.1
```

ビルド
```
cd mithril-client-cli
make build
```

バージョン確認
```
./mithril-client -V
```
> mithril-client 0.5.17

システムフォルダへコピー
```
sudo mv mithril-client /usr/local/bin/mithril-client
```

バージョン確認
```
mithril-client -V
```
> mithril-client 0.5.17

### **5-4.DBダウンロード・解凍**

tmux作業ウィンドウを作成する
```
tmux new -s mithril
```

3-1.変数セット
```
export NETWORK=preprod
export AGGREGATOR_ENDPOINT=https://aggregator.release-preprod.api.mithril.network/aggregator
export GENESIS_VERIFICATION_KEY=$(wget -q -O - https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/release-preprod/genesis.vkey)
export SNAPSHOT_DIGEST=latest
```


??? その他のネットワークの場合
    === 'Preview(テストネット)'
        ```
        export NETWORK=preview
        export AGGREGATOR_ENDPOINT=https://aggregator.pre-release-preview.api.mithril.network/aggregator
        export GENESIS_VERIFICATION_KEY=$(wget -q -O - https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/pre-release-preview/genesis.vkey)
        export SNAPSHOT_DIGEST=latest
        ```


    === 'Mainnet(メインネット)'
        ```
        export NETWORK=mainnet
        export AGGREGATOR_ENDPOINT=https://aggregator.release-mainnet.api.mithril.network/aggregator
        export GENESIS_VERIFICATION_KEY=$(wget -q -O - https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/release-mainnet/genesis.vkey)
        export SNAPSHOT_DIGEST=latest
        ```

3-2.最新スナップショットDL

既存DBフォルダ削除
```
rm -rf $NODE_HOME/db
```

最新スナップショットダウンロード及び解凍
```
mithril-client snapshot download --download-dir $NODE_HOME latest
```
> スナップショットダウンロード～解凍まで自動的に行われます。1/5～5/5が終了するまで待ちましょう

tmux作業ウィンドウを終了する
```
exit
```

??? tip "その他のmithril-clientコマンド"

    **Cardanoノードをブートストラップできる利用可能なスナップショットを一覧表示**
    ```
    mithril-client snapshot list
    ```

    戻り値
    ``` { .yaml .no-copy }
    +-------+-----------+---------+------------------------------------------------------------------+-------------+-----------+-----------------------------------+
    | Epoch | Immutable | Network | Digest                                                           | Size        | Locations | Created                           |
    +-------+-----------+---------+------------------------------------------------------------------+-------------+-----------+-----------------------------------+
    | 438   | 4822      | mainnet | dfc05780e0aaefc0e0466cbf69f3c82561e99f8b208626b9870a2e69344199dc | 40337208527 |         1 | 2023-09-27 05:21:39.339429454 UTC |
    +-------+-----------+---------+------------------------------------------------------------------+-------------+-----------+-----------------------------------+
    | 438   | 4821      | mainnet | bbe08607a326c1d6e52c43897808b8ca4c02cc0fbb3d0248b341fd7bbc81f2e3 | 40328088621 |         1 | 2023-09-26 23:13:39.908538941 UTC |
    +-------+-----------+---------+------------------------------------------------------------------+-------------+-----------+-----------------------------------+
    | 438   | 4820      | mainnet | d993a6267fefa1c34c0f270337dc3fa5324bc399f908e4a38ec80bb3348e8fe1 | 40320340866 |         1 | 2023-09-26 17:31:56.927673920 UTC |
    +-------+-----------+---------+------------------------------------------------------------------+-------------+-----------+-----------------------------------+
    | 438   | 4819      | mainnet | f8dd9c7ee08c6dffebe851a19af44bcb82990d4c174dc366dfaa18e40c20b842 | 40316728370 |         1 | 2023-09-26 11:50:50.123658352 UTC |
    +-------+-----------+---------+------------------------------------------------------------------+-------------+-----------+-----------------------------------+
    | 438   | 4818      | mainnet | 70c5c6847116d0a4ca93f81ac193db9d2a17084065963ae298646a157825ab7e | 40314024073 |         1 | 2023-09-26 05:44:57.236767751 UTC |
    +-------+-----------+---------+------------------------------------------------------------------+-------------+-----------+-----------------------------------+
    | 438   | 4817      | mainnet | 0597ca3e7d699155ce73aaae53805ea32a981ff213f772dd70e9dbead626acf2 | 40299093577 |         1 | 2023-09-25 23:13:32.500760943 UTC |
    +-------+-----------+---------+------------------------------------------------------------------+-------------+-----------+-----------------------------------+
    | 438   | 4816      | mainnet | 074a576bce34006369837899ecdaaac69f18e31dd193aaa5527d32a7c36fb10e | 40285275527 |         1 | 2023-09-25 17:33:02.562751472 UTC |
    +-------+-----------+---------+------------------------------------------------------------------+-------------+-----------+-----------------------------------+
    ```

    **スナップショット詳細表示**
    ```
    mithril-client snapshot show (Digestハッシュ値指定)
    ```
    戻り値
    ``` { .yaml .no-copy }
    +-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Info                  | Value                                                                                                                                                                         |
    +-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Epoch                 | 438                                                                                                                                                                           |
    +-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Immutable File Number | 4821                                                                                                                                                                          |
    +-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Network               | mainnet                                                                                                                                                                       |
    +-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Digest                | bbe08607a326c1d6e52c43897808b8ca4c02cc0fbb3d0248b341fd7bbc81f2e3                                                                                                              |
    +-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Size                  | 40328088621                                                                                                                                                                   |
    +-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Cardano node version  | 8.1.2                                                                                                                                                                         |
    +-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Location 1            | https://storage.googleapis.com/cdn.aggregator.release-mainnet.api.mithril.network/mainnet-e438-i4821.bbe08607a326c1d6e52c43897808b8ca4c02cc0fbb3d0248b341fd7bbc81f2e3.tar.zst |
    +-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Created               | 2023-09-26 23:13:39.908538941 UTC                                                                                                                                             |
    +-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Compression Algorithm | Zstandard                                                                                                                                                                     |
    +-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    ```