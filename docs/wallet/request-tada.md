# **テストAda（tAda）のリクエスト**

## **テストネットの蛇口（Testnets faucet）とは？**

<figure markdown="span">
  ![cardano-faucet-Pic](../images/cardano-faucet.png){ width="300" height="150" }
  <figcaption></figcaption>
</figure>

## テストネット用ADA（tAda）
カルダノテストネットで使用するテストネット用ADA（tAda）を提供するサービスです。
!!! tip "詳細"
    {==カルダノテストネットは、カルダノメインネットとは別の独立したネットワークであるため、独自のトークンが必要==}です。このテストネット用ADA（tAda）には「現実世界」の価値はありませんが、ユーザーはメインネットで実際のADAを費やすことなく、カルダノテストネット機能を試すことが可能です。  
    
    例えば`tAda`を使って次のようなことができます。
    ``` { .yaml .no-copy }
    - ネイティブトークンを鋳造
    - カルダノウォレットを使って送受信
    - ステークプールの運営方法を学ぶ
    ```

## **リクエスト方法**

まずはじめに[Testnets faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)のサイトにアクセスします。

実際にTestnets faucetから**`tAda`**をリクエストしてみましょう！

!!! tip "**`Preprod`**テストネットを前提に進めます。"
> faucetからは`1日あたり 1000tADA`が供給されますので必要であればリクエストしてください。

  1. **`Environment`**には、**`Preprod`** `Testnet`を選択
  2. **`Action`**には、**`Receive test ADA`**を選択
  3. **`Address`**には、**`以下のコマンド実行後のアドレス`**を貼り付け
    ``` bash
    echo "$(cat $NODE_HOME/payment.addr)"
    ```
  4. **`reCAPTCHA`**（私はロボットではありません）にチェック
  5. **`REQUEST FUNDS`**ボタンをクリック
  6. 支払いアドレスに送金後、残高を確認  
   
    !!! tip "Tip"
        完全に同期されていない場合は、残高が表示されないため、ノードをブロックチェーンと完全に同期させておく必要があります。
        
    ``` bash
    cardano-cli query utxo \
        --address $(cat payment.addr) \
        $NODE_NETWORK
    ```

  7.  次のように表示されたら入金完了です。
    ``` { .yaml .no-copy }
                              TxHash                                 TxIx        Amount
    --------------------------------------------------------------------------------------
    f2f34b********************************************************     0        10000000000 lovelace + TxOutDatumNone
    ```

??? info "tAdaの使用後について"
    テストネット用ADAの使用を終えたら、他のコミュニティメンバーが使用できるように、テストネット用ADAを蛇口に戻してください。
    ``` title="tAdaの返送先"
    addr_test1qqr585tvlc7ylnqvz8pyqwauzrdu0mxag3m7q56grgmgu7sxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flknswgndm3
    ```
