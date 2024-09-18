import React, {useEffect, useState} from "react";

export function TabHelp({getComponent}) {
  const [description, setDescription] = useState("");

  const Markdown = getComponent("Markdown", true);

  useEffect(() => {
    // Fetch the content of the description.md file
    fetch("help.md").then((response) => response.text()).then((text) => setDescription(text)).catch((error) => console.error("Error loading description:", error));
  }, []);

  return (<div>
    <Markdown source={description}/>
  </div>);
}
