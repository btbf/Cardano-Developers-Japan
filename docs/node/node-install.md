# **ノードインストール(PreProdテストネット)**

## **概要**

### **必要スペック**
!!! tip "必要要件について"
    ネットワークにより必要要件が異なりますのでご確認ください。

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

    !!! warning "留意事項"
        最新のGHC/Cabalバージョンは`cardano-node/cli`のビルドに失敗するため必ず指定されたバージョンをインストールしてください。

## **依存関係のインストール**

Ubuntuを最新状態に更新し、必要なパッケージをインストールします。  
新規tmuxセッションを開設後、作業ディレクトリを作成し、依存関係のインストールを実施します。  

``` bash
sudo apt update -y && sudo apt upgrade -y
sudo apt install git jq bc automake tmux rsync htop curl build-essential pkg-config libffi-dev libgmp-dev libssl-dev libtinfo-dev libsystemd-dev zlib1g-dev make g++ wget libncursesw5 libtool autoconf liblmdb-dev -y
tmux new -s build
mkdir $HOME/git
```

- ### **Libsodium**
``` bash
cd $HOME/git
git clone https://github.com/IntersectMBO/libsodium
cd libsodium
git checkout dbb48cc
./autogen.sh
./configure
make
sudo make install
```

    !!! tip "Tip"
        makeコマンド実行中に `warning` が後半出現しますが、特に問題ないため無視して大丈夫です。

- ### **Secp256k1**
``` bash
cd $HOME/git
git clone https://github.com/bitcoin-core/secp256k1.git
```
``` bash
cd secp256k1/
git checkout ac83be33
./autogen.sh
./configure --prefix=/usr --enable-module-schnorrsig --enable-experimental
make
sudo make install
```

- ### **blst**
blstをダウンロードし、設定ファイルを作成、その設定ファイルをコピーします。
``` bash
cd $HOME/git
git clone https://github.com/supranational/blst
cd blst
git checkout v0.3.10
./build.sh
```
``` bash title="libblst.pc"
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
``` bash
sudo cp libblst.pc /usr/local/lib/pkgconfig/
sudo cp bindings/blst_aux.h bindings/blst.h bindings/blst.hpp  /usr/local/include/
sudo cp libblst.a /usr/local/lib
sudo chmod u=rw,go=r /usr/local/{lib/{libblst.a,pkgconfig/libblst.pc},include/{blst.{h,hpp},blst_aux.h}}
```

- ### **GHCUP**
インストール変数を設定し、インストールします。
``` bash
cd $HOME
BOOTSTRAP_HASKELL_NONINTERACTIVE=1
BOOTSTRAP_HASKELL_NO_UPGRADE=1
BOOTSTRAP_HASKELL_INSTALL_NO_STACK=yes
BOOTSTRAP_HASKELL_ADJUST_BASHRC=1
unset BOOTSTRAP_HASKELL_INSTALL_HLS
export BOOTSTRAP_HASKELL_NONINTERACTIVE BOOTSTRAP_HASKELL_INSTALL_STACK BOOTSTRAP_HASKELL_ADJUST_BASHRC
```
``` bash
curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | bash
```

    !!! warning "留意事項"
        最新バージョンは**`cardano-node/cli`**のビルドに失敗するため、必ず以下で指定されたバージョンをインストールしてください。
cabal、GHCのインストール
``` bash
source ~/.bashrc
ghcup upgrade
ghcup install cabal 3.8.1.0
ghcup set cabal 3.8.1.0
```
``` bash
ghcup install ghc 8.10.7
ghcup set ghc 8.10.7
```
バージョン確認
``` bash
cabal update
cabal --version
ghc --version
```

    !!! tip "バージョンチェック"
        以下のバージョンであることを確認してください。  
        
        | Cabalバージョン | GHCバージョン |
        | ----------- | ------------------------------------ |
        | **`3.8.1.0`** | **`8.10.7`** |

## **ビルド**

専用リポジトリからダウンロード後、Cabalのビルドオプションを構成し、カルダノノードをビルドします。

``` bash
cd $HOME/git
git clone https://github.com/IntersectMBO/cardano-node.git
cd cardano-node
git fetch --all --recurse-submodules --tags
git checkout tags/8.7.3
```

``` bash
cabal clean
cabal update
cabal configure --with-compiler=ghc-8.10.7
```

``` bash
cabal build cardano-cli cardano-node
```

!!! tip "Tip"
    サーバスペックによって、ビルド完了までの所要時間が数分から数時間かかる場合があります。


ビルド完了後、binディレクトリに**`cardano-cli`**と**`cardano-node`**をコピーします。

``` bash
sudo cp $(find $HOME/git/cardano-node/dist-newstyle/build -type f -name "cardano-cli") /usr/local/bin/cardano-cli
sudo cp $(find $HOME/git/cardano-node/dist-newstyle/build -type f -name "cardano-node") /usr/local/bin/cardano-node
```

バージョンチェック  
**`cardano-cli`**と**`cardano-node`**のバージョンが最新Gitタグバージョンであることを確認してください。

``` bash
cardano-cli version
cardano-node version
```

!!! tip "戻り値チェック"
    **`cardano-cli`**と**`cardano-node`**のバージョンが最新Gitタグバージョンであることを確認してください。
    ``` { .yaml .no-copy }
    cardano-cli 8.17.0.0 - linux-x86_64 - ghc-8.10  
    git rev a4a8119b59b1fbb9a69c79e1e6900e91292161e7  
    
    cardano-node 8.7.3 - linux-x86_64 - ghc-8.10  
    git rev a4a8119b59b1fbb9a69c79e1e6900e91292161e7  
    ```

tmuxセッションを閉じます。

``` bash
exit
```

### **環境変数の設定、再読み込み**
環境変数に接続ネットワーク等を指定後、`.bashrc`を再読み込みします。
> ノード設定ファイルは`$NODE\_HOME(例：/home/user/cnode)`に設定されます。

``` bash
echo PATH="$HOME/.local/bin:$PATH" >> $HOME/.bashrc
echo export LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH" >> $HOME/.bashrc
echo export PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH" >> $HOME/.bashrc
echo export NODE_HOME=$HOME/cnode >> $HOME/.bashrc
echo export NODE_CONFIG=preprod >> $HOME/.bashrc
echo export NODE_NETWORK='"--testnet-magic 1"' >> $HOME/.bashrc
echo export CARDANO_NODE_NETWORK_ID=1 >> $HOME/.bashrc
```

??? その他のネットワークの場合はこちら
    === "Preview(テストネット)"
        ``` bash
        echo export NODE_CONFIG=preview >> $HOME/.bashrc
        echo export NODE_NETWORK='"--testnet-magic 2"' >> $HOME/.bashrc
        echo export CARDANO_NODE_NETWORK_ID=2 >> $HOME/.bashrc
        ```
    
    
    === "Mainnet(メインネット)"
        ``` bash
        echo export NODE_CONFIG=mainnet >> $HOME/.bashrc
        echo export NODE_NETWORK='"--mainnet"' >> $HOME/.bashrc
        echo export CARDANO_NODE_NETWORK_ID=mainnet >> $HOME/.bashrc
        ```
    
``` bash
source $HOME/.bashrc
```

### **ノード設定ファイルの修正**

!!! info "ノード構成設定ファイルの取得"
    ノード構成に必要な設定ファイルを取得します。  
    **`config.json`**、**`genesis.json`**、**`topology.json`**

``` bash
mkdir $NODE_HOME
cd $NODE_HOME
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/byron-genesis.json -O ${NODE_CONFIG}-byron-genesis.json
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/topology.json -O ${NODE_CONFIG}-topology.json
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/shelley-genesis.json -O ${NODE_CONFIG}-shelley-genesis.json
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/alonzo-genesis.json -O ${NODE_CONFIG}-alonzo-genesis.json
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/conway-genesis.json -O ${NODE_CONFIG}-conway-genesis.json
wget --no-use-server-timestamps -q https://book.play.dev.cardano.org/environments/${NODE_CONFIG}/config.json -O ${NODE_CONFIG}-config.json
```

以下のコードを実行し、**`config.json`**を更新後、環境変数を追加し、**`.bashrc`**を更新します。

``` bash
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

``` bash
echo export CARDANO_NODE_SOCKET_PATH="$NODE_HOME/db/socket" >> $HOME/.bashrc
source $HOME/.bashrc
```


## **オンチェーンDBダウンロード**

!!! hint "ミスリルプロトコルとは？"
    ミスリルは、{==IOG研究論文[Mithril: Stake-based Threshold Multisignatures](https://iohk.io/en/research/library/papers/mithril-stake-based-threshold-multisignatures/)に基づいて開発されたマルチ署名プロトコルです。==}

    * 現時点ではステークプールオペレータがミスリルアグリゲーターが作成するスナップショットDBに署名することで、チェーンデータを保証します。
    * メインネットの場合、`ノード初回起動時のDB同期時間`を`約2日`から`約30分以内`にまで短縮できます。
    > スナップショットノードバージョンとサーバーノードバージョンが異なる場合、DB再構築処理が入る場合があり、DB同期までに数時間かかります。


### **依存環境のインストール**


``` bash
sudo apt install -y libssl-dev build-essential m4 jq
```

### **Rustのインストール**

RUST環境の準備をし、rustupをインストールします。

``` bash
mkdir $HOME/.cargo && mkdir $HOME/.cargo/bin
chown -R $USER $HOME/.cargo
touch $HOME/.profile
chown $USER $HOME/.profile
```

``` bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
!!! tip "Tip"
    1) Proceed with installation (default)  
    > ++1++ を入力し、++enter++

``` bash
source $HOME/.cargo/env
```

``` bash
rustup install stable
rustup default stable
rustup update
rustup component add clippy rustfmt
rustup target add x86_64-unknown-linux-musl
```

### **Mithril-Clientのインストール**

専用リポジトリからダウンロードし、ビルドします。

``` bash
cd $HOME/git
git clone https://github.com/input-output-hk/mithril.git
```

``` bash
cd mithril
git fetch --all --prune
git checkout tags/2403.1
```

``` bash
cd mithril-client-cli
make build
```

ビルド完了後のバージョン確認

``` bash
./mithril-client -V
```
!!!tip "バージョン確認"
    ``` { .yaml .no-copy }
    mithril-client 0.5.17
    ```

システムフォルダへコピー後のバージョン確認

``` bash
sudo mv mithril-client /usr/local/bin/mithril-client
```

``` bash
mithril-client -V
```
!!!tip "バージョン確認"
    ``` { .yaml .no-copy }
    mithril-client 0.5.17
    ```

### **DBダウンロード・解凍**

新規tmuxセッション開設し、変数を設定します。

``` bash
tmux new -s mithril
```

``` bash
export NETWORK=preprod
export AGGREGATOR_ENDPOINT=https://aggregator.release-preprod.api.mithril.network/aggregator
export GENESIS_VERIFICATION_KEY=$(wget -q -O - https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/release-preprod/genesis.vkey)
export SNAPSHOT_DIGEST=latest
```

??? その他のネットワークの場合
    === "Preview(テストネット)"
        ``` bash
        export NETWORK=preview
        export AGGREGATOR_ENDPOINT=https://aggregator.pre-release-preview.api.mithril.network/aggregator
        export GENESIS_VERIFICATION_KEY=$(wget -q -O - https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/pre-release-preview/genesis.vkey)
        export SNAPSHOT_DIGEST=latest
        ```
    
    
    === "Mainnet(メインネット)"
        ``` bash
        export NETWORK=mainnet
        export AGGREGATOR_ENDPOINT=https://aggregator.release-mainnet.api.mithril.network/aggregator
        export GENESIS_VERIFICATION_KEY=$(wget -q -O - https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/release-mainnet/genesis.vkey)
        export SNAPSHOT_DIGEST=latest
        ```

最新のスナップショットをダウンロードするため、既存のDBフォルダを削除後、最新スナップショットをダウンロード及び解凍し、tmux作業ウィンドウを終了します。  
!!! tip "Tip"
    スナップショットダウンロード～解凍まで自動的に行われます。{==1/5～5/5が終了するまでお待ちください。==}

``` bash
rm -rf $NODE_HOME/db
```

``` bash
mithril-client snapshot download --download-dir $NODE_HOME latest
```

``` bash
exit
```

- ## その他のmithril-clientコマンド

??? tip "その他のmithril-clientコマンドについて"

    **Cardanoノードをブートストラップできる利用可能なスナップショットを一覧表示**
    
    ``` bash
    mithril-client snapshot list
    ```

    - 戻り値
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
    
    !!! example "例"
        ``` bash
        mithril-client snapshot show bbe08607a326c1d6e52c43897808b8ca4c02cc0fbb3d0248b341fd7bbc81f2e3
        ```
        > 引数には、Digestハッシュ値（`bbe08607a326c1d6e52c43897808b8ca4c02cc0fbb3d0248b341fd7bbc81f2e3`）を指定します。
    
    
    - 戻り値
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
