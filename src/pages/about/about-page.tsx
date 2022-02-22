import React from "react"
import { Page } from "../../components/page"
import { InlineCode } from "../../components/common/inline-code"

export function AboutPage() {
  return (
      <Page header="About this example">
          With this example, you can:
          <ul>
              <li>Connect wallets</li>
              <li>Deploy collections</li>
              <li>Mint NFTs</li>
              <li>Sell NFTs</li>
              <li>Buy NFTs</li>
              <li>Make and accept Bid</li>
          </ul>
          This example uses:
          <ul>
              <li><InlineCode>@rarible/sdk</InlineCode> — <a href="https://github.com/rarible/sdk">Rarible Protocol SDK</a></li>
              <li><InlineCode>@rarible/connector</InlineCode> — <a href="https://github.com/rarible/sdk/tree/master/packages/connector">Rarible SDK Wallet Connector</a></li>
              <li><InlineCode>@rixio/react</InlineCode> — <a href="https://github.com/roborox/rixio">Rixio</a></li>
          </ul>
          See more information about SDK usage in <a href="https://docs.rarible.org/">Protocol documentation</a>.
      </Page>
  );
}
