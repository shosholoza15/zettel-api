export default async function handler(req, res) {
  const { tag } = req.query;
  const notionApiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  const query = {
    filter: {
      property: "Tags",
      multi_select: {
        contains: tag
      }
    }
  };

  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${notionApiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(query)
  });

  const data = await response.json();

  const notes = data.results.map((page) => {
    const props = page.properties;
    return {
      title: props.Title?.title?.[0]?.text?.content || "Untitled",
      summary: props.Summary?.rich_text?.[0]?.text?.content || "",
      snippet: props.Snippet?.rich_text?.[0]?.text?.content || "",
      my_take: props["My Take"]?.rich_text?.[0]?.text?.content || "",
      tags: props.Tags?.multi_select?.map(t => t.name) || [],
      url: props.URL?.url || ""
    };
  });

  res.status(200).json(notes);
}
