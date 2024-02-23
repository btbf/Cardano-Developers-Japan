# ノードを起動する

## **1. ノード起動スクリプトの作成**

起動スクリプトには、ディレクトリ、ポート番号、DBパス、構成ファイルパス、トポロジーファイルパスなど、カルダノノードを実行するために必要な変数が含まれています。


起動スクリプトファイルを作成する
```bash
cat > $NODE_HOME/startRelayNode1.sh << EOF 
#!/bin/bash
DIRECTORY=$NODE_HOME
PORT=6000
HOSTADDR=0.0.0.0
TOPOLOGY=\${DIRECTORY}/${NODE_CONFIG}-topology.json
DB_PATH=\${DIRECTORY}/db
SOCKET_PATH=\${DIRECTORY}/db/socket
CONFIG=\${DIRECTORY}/${NODE_CONFIG}-config.json
/usr/local/bin/cardano-node +RTS -N --disable-delayed-os-memory-return -I0.1 -Iw300 -A16m -F1.5 -H2500M -RTS run --topology \${TOPOLOGY} --database-path \${DB_PATH} --socket-path \${SOCKET_PATH} --host-addr \${HOSTADDR} --port \${PORT} --config \${CONFIG}
EOF
```

起動スクリプトに実行権限を付与する
   
```bash
cd $NODE_HOME
chmod +x startRelayNode1.sh
```

## **2. 自動起動の設定(systemd)**

ユニットファイルを作成します。

```bash
cat > $NODE_HOME/cardano-node.service << EOF 
# The Cardano node service (part of systemd)
# file: /etc/systemd/system/cardano-node.service 

[Unit]
Description     = Cardano node service
Wants           = network-online.target
After           = network-online.target 

[Service]
User            = ${USER}
Type            = simple
WorkingDirectory= ${NODE_HOME}
ExecStart       = /bin/bash -c '${NODE_HOME}/startRelayNode1.sh'
KillSignal=SIGINT
RestartKillSignal=SIGINT
TimeoutStopSec=300
LimitNOFILE=32768
Restart=always
RestartSec=5
SyslogIdentifier=cardano-node

[Install]
WantedBy	= multi-user.target
EOF
```

`/etc/systemd/system`にユニットファイルをコピーして、権限を付与します。

```bash
sudo cp $NODE_HOME/cardano-node.service /etc/systemd/system/cardano-node.service
```

```bash
sudo chmod 644 /etc/systemd/system/cardano-node.service
```

次のコマンドを実行して、OS起動時にサービスの自動起動を有効にします。

```text
sudo systemctl daemon-reload
sudo systemctl enable cardano-node
```

!!! hint "エイリアス設定"
    スクリプトへのパスを通し、任意の単語で起動出来るようにする。
    ```bash
    echo alias cnode='"journalctl -u cardano-node -f"' >> $HOME/.bashrc
    echo alias cnstart='"sudo systemctl start cardano-node"' >> $HOME/.bashrc
    echo alias cnrestart='"sudo systemctl reload-or-restart cardano-node"' >> $HOME/.bashrc
    echo alias cnstop='"sudo systemctl stop cardano-node"' >> $HOME/.bashrc
    source $HOME/.bashrc
    ```

    単語を入力するだけで、起動状態(ログ)を確認できます。  
    ``` { .yaml .no-copy }
    cnode ・・・ログ表示
    cnstart ・・・ノード起動
    cnrestart ・・・ノード再起動
    cnstop ・・・ノード停止
    ```

## **3. gLiveViewのインストール**
 

!!! info ""
    gLiveViewはノードステータスを可視化するTUIツールです。  
    このツールはカルダノコミュニティ [Guild Operators](https://cardano-community.github.io/guild-operators/#/Scripts/gliveview) の功績によるものです。


Guild LiveViewをインストールします。

```bash
mkdir $NODE_HOME/scripts
cd $NODE_HOME/scripts
sudo apt install bc tcptraceroute -y
```
```bash
curl -s -o gLiveView.sh https://raw.githubusercontent.com/cardano-community/guild-operators/master/scripts/cnode-helper-scripts/gLiveView.sh
curl -s -o env https://raw.githubusercontent.com/cardano-community/guild-operators/master/scripts/cnode-helper-scripts/env
chmod 755 gLiveView.sh
```



```bash
sed -i $NODE_HOME/scripts/env \
    -e '1,73s!#CNODE_HOME="/opt/cardano/cnode"!CNODE_HOME=${NODE_HOME}!' \
    -e '1,73s!#UPDATE_CHECK="Y"!UPDATE_CHECK="N"!' \
    -e '1,73s!#CONFIG="${CNODE_HOME}/files/config.json"!CONFIG="${CNODE_HOME}/'${NODE_CONFIG}'-config.json"!' \
    -e '1,73s!#SOCKET="${CNODE_HOME}/sockets/node0.socket"!SOCKET="${CNODE_HOME}/db/socket"!'
```


## **4.ノードを起動する**
```bash
sudo systemctl start cardano-node
```

ノードログを確認する
```
journalctl --unit=cardano-node --follow
```
!!! note "チェーン同期確認"
    * `Started opening Ledger DB` と表示されていたら同期準備中です。
    * チェーン同期までに4分前後かかります。
    * Ctrl + c で閉じてもノードは停止しません。


GliveView起動エイリアス登録
```bash
echo alias glive="'cd $NODE_HOME/scripts; ./gLiveView.sh'" >> $HOME/.bashrc
source $HOME/.bashrc
```
    
gLiveviewを起動する

```bash
glive
```

![Guild Live View](../images/glive.PNG)