import Discord from 'discord.js';
import scheduler from 'node-schedule';
import dotenv from 'dotenv';
import {mapXMLtoObj, datToLink, checkPDB, checkUnpackedX2} from './parseXML.js';

const client = new Discord.Client({intents: [Discord.IntentsBitField.Flags.MessageContent]}); //Create new Discord Client instance
dotenv.config(); //DotEnv configuration import

const client_links =
{
  //Private Servers
  'EU_RIFT' : 'http://cdn1.elsrift.to/rift/PatchPath.dat'
};

let XMLHashes = //xxHash of XML's for comparing patch version
{
  //Private Servers
  'EU_RIFT' : '',
};

let LastUpdated = 
{
  'EU_RIFT' : '',
}

client.on('ready', () => 
{
  console.log(`Logged in as ${client.user.tag}!`);
});

//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token

scheduler.scheduleJob('30 25 2 * * *', async function message() //Automatically run everyday at 2:25:30 AM       
{
  for(const [region, link] of Object.entries(client_links))
  {
    let XMLObj = await mapXMLtoObj(await datToLink(link));

    if(XMLObj == undefined) //If the XML Object was not made, then skip the rest of the function.
      continue;

    let strXMLHash = XMLObj.elements[0].elements[2].attributes.Sign;
    let strPDBLink = checkPDB(XMLObj);
    let strUnpackedX2Link = checkUnpackedX2(XMLObj);
    let bUpdated = false;

    if(XMLHashes[region] != strXMLHash) //Check if the game is updated via checksum comparison
    {
      XMLHashes[region] = strXMLHash;
      LastUpdated[region] = new Date().toLocaleDateString(); //Set patch date
      bUpdated = true;
    }

    if(bUpdated == true) //If the client has been updated, push to the ClientInfo Object array.
    {
      const EmbedMessage = {
        color: 0x0099ff,
        title: region,
        author: {
          name: 'YuilMuil',
          icon_url: 'https://avatars.githubusercontent.com/u/6235519?v=4',
          url: 'https://github.com/YuilMuil',
        },
        description: 'Client Update',
        fields: [
          {name: 'XML Hash', value: XMLHashes[region], inline: false},
          {name: 'PDB Avaliability', value: strPDBLink, inline: true},
          {name: 'Unpacked Binary Avaliability', value: strUnpackedX2Link, inline: true},
          {name: 'Last Updated', value: LastUpdated[region], inline: true},
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Powered by rPoseidon and Caffeine :)', iconURL: 'https://avatars.githubusercontent.com/u/6235519?v=4' }
      };
      

      client.channels.fetch(process.env.CHANNEL_TOKEN).then(channel => channel.send({embeds: [EmbedMessage]}));
      //message.channels.cache.get(process.env.CHANNEL_TOKEN).send({embeds: [tmpObj]});
    }
  }
})
