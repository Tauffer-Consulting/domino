import React from "react";

import { PaperA42 } from "./PaperA42";

interface Props {
  jsxContent: JSX.Element[];
}

const DynamicContent: React.FC<Props> = ({ jsxContent }) => {
  return (
    <PaperA42>
      {jsxContent.map((element, index) => (
        <div key={index} style={{ marginBottom: "10mm" }}>
          {element}
        </div>
      ))}
    </PaperA42>
  );
};

export default DynamicContent;
