# **ウォレットキーの生成**

## **カルダノ暗号化鍵について**
!!! info "カルダノ暗号化鍵の説明"
    カルダノ暗号化鍵は、公開検証鍵ファイルと秘密鍵ファイルを含む**`ed25519`**キーペアで構成されており、公開鍵ファイルは、通常`keyname.vkey`と呼ばれ、秘密鍵ファイルは、`keyname.skey`と呼ばれます。トランザクションの署名に使用される秘密鍵ファイルは非常に機密性が高いため、適切に保護する必要があります。キーペアのファイル名は完全にランダムなので任意の名前を付けることも可能です。秘密鍵の紛失、上書きなどに注意してください。  
    > 本ドキュメントではテストネットのためエアギャップマシン作成はスキップします。

## **ウォレットアドレスのキーペアに関する用途説明**
現在、カルダノウォレットアドレスには、以下の**`2`つ**しかありません。

1. 支払いアドレス
2. ステーキングアドレス

{==**支払いアドレス** (関連するキーペアとともに) は、お金の保管、受信、送信に使用されます。==}

- Payment.**{==vkey==}**は、支払いアドレスの{==**公開検証鍵**ファイル==}
> 機密ではないため、公開で共有される可能性有り
- payment.**{==skey==}**は、非常に機密性の高い支払いアドレスの{==**秘密署名鍵**ファイル==}
> 秘密署名鍵ファイルを使用すると、支払いアドレスのお金にアクセスできるようになるため適切に管理してください。
- **`payment.addr`**は、支払アドレスファイルです。

!!! warning "留意事項"
    **`payment.vkey`**、**`payment.skey`**を作成後、これらのファイルは紛失しないようにご留意ください。

## **キー、アドレスの作成**

- ### **支払いキーの作成**
``` bash
cd $NODE_HOME
cardano-cli address key-gen \
    --verification-key-file payment.vkey \
    --signing-key-file payment.skey
```

- ### **支払い用アドレスの作成**
``` bash
cardano-cli address build \
    --payment-verification-key-file payment.vkey \
    --out-file payment.addr \
    $NODE_NETWORK
```

- ### **パーミッション変更**
``` bash
chmod 400 payment.vkey
chmod 400 payment.skey
chmod 400 payment.addr
```

## **プロトコルパラメータの取得**
``` bash
cd $NODE_HOME
cardano-cli query protocol-parameters \
    $NODE_NETWORK \
    --out-file params.json
```


## **支払い用アドレスに入金**

!!! info "入金について"
    [テストネット用ADAのリクエスト](././request-tada.md/#_1)して、あなたの支払いアドレスに入金します。
