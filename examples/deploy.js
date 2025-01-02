async function createDynamicToken() {
  try {
    const imagesDirectory = "./images";
    const files = fs.readdirSync(imagesDirectory);

    if (files.length === 0) {
      console.log("No images available for token creation.");
      return;
    }

    const firstFile = files[0];
    const filePath = path.join(imagesDirectory, firstFile);
    const fileNameWithoutExtension = path.parse(firstFile).name;

    const symbol = fileNameWithoutExtension
      .replace(/[aeiouAEIOU]/g, "")
      .toUpperCase();

    const mintKeypair = Keypair.generate();
    const tokenDynAddress = fileNameWithoutExtension;

    const tokenMetadata = {
      name: tokenDynAddress,
      symbol,
      description: `An AI-generated meme token`,
      file: filePath,
    };

    const tokenDynURI = await uploadToIpfs(tokenMetadata);
    await sendLocalCreateBundle(tokenDynURI, tokenMetadata,tokenDynAddress);

    fs.unlinkSync(filePath);
    console.log(`Image used and deleted: ${firstFile}`);
  } catch (error) {
    console.error("Error creating dynamic token:", error.message);
  }
}



async function uploadToIpfs(metadata) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(metadata.file));
  formData.append("name", metadata.name);
  formData.append("symbol", metadata.symbol);
  formData.append("description", metadata.description);

  console.log("Uploading metadata to Pump.fun...");
  const response = await fetch(pumpIpfsUrl, {
    method: "POST",
    body: formData,
    headers: formData.getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error uploading to IPFS: ${response.statusText}`);
  }

  const responseJson = await response.json();
  console.log("Metadata uploaded successfully:", responseJson.metadataUri);
  return responseJson.metadataUri;
}
