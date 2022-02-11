import React from "react"
import { Page } from "../../components/page"
import { InlineCode } from "../../components/common/inline-code"

export function AboutPage() {
  return (
      <Page header="About this example">
          This example uses:
          <ul>
              <li><InlineCode>@rarible/sdk</InlineCode></li>
              <li><InlineCode>@rarible/connector</InlineCode></li>
              <li><InlineCode>@rixio/react</InlineCode> https://github.com/roborox/rixio</li>
          </ul>
      </Page>
  );
}
