require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const puppeteer = require('puppeteer');
const { PuppeteerBlocker } = require('@cliqz/adblocker-puppeteer');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
const { execFile } = require('child_process');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Discord bot is running!');
});
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
const { Octokit } = require('@octokit/rest');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [
  new SlashCommandBuilder()
    .setName('tiktok')
    .setDescription('Download a TikTok video without watermark')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('TikTok video URL')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('instagram')
    .setDescription('Download an Instagram video, photo, reel, or story')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Instagram post/reel/story URL')
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );
    console.log('Slash command registered.');
  } catch (error) {
    console.error(error);
  }
})();

function getRandomStatus(botName, platform) {
  const statusSets = {
    tiktok: [
      `${botName} is fetching your TikTok...`,
      `${botName} is putting the pieces together...`,
      `${botName} is working her magic...`,
      `${botName} is downloading your TikTok...`,
      `${botName} is making your TikTok video cuter...`,
      `${botName} is compressing your TikTok...`,
      `${botName} is almost done...`,
    ],
    youtube: [
      `${botName} is fetching your YouTube video...`,
      `${botName} is working her YouTube magic...`,
      `${botName} is downloading your YouTube video...`,
      `${botName} is extracting your YouTube audio...`,
      `${botName} is compressing your YouTube video...`,
      `${botName} is almost done with YouTube...`,
    ],
    instagram: [
      `${botName} is fetching your Instagram media...`,
      `${botName} is working her Insta magic...`,
      `${botName} is downloading your Instagram post...`,
      `${botName} is compressing your Instagram video...`,
      `${botName} is almost done with Instagram...`,
    ],
    default: [
      `${botName} is fetching your media...`,
      `${botName} is working her magic...`,
      `${botName} is almost done...`,
    ]
  };
  const statuses = statusSets[platform] || statusSets.default;
  return statuses[Math.floor(Math.random() * statuses.length)];
}

async function uploadToGitHubRepo(localFilePath, repo, branch = 'storage') {
  const fileContent = fs.readFileSync(localFilePath);
  const fileName = path.basename(localFilePath);
  const repoPath = `_temp/${fileName}`;
  let sha;
  try {
    const { data } = await octokit.repos.getContent({
      owner: 'kryptik-dev',
      repo,
      path: repoPath,
      ref: branch,
    });
    sha = data.sha;
  } catch (e) {
    if (e.status !== 404) throw e;
    sha = undefined;
  }
  const params = {
    owner: 'kryptik-dev',
    repo,
    path: repoPath,
    message: `Upload temp file ${fileName}`,
    content: fileContent.toString('base64'),
    branch,
  };
  if (sha) params.sha = sha;
  await octokit.repos.createOrUpdateFileContents(params);
  // Schedule deletion after 24 hours
  setTimeout(async () => {
    try {
      await octokit.repos.deleteFile({
        owner: 'kryptik-dev',
        repo,
        path: repoPath,
        message: `Delete temp file ${fileName} after 24h`,
        sha: (await octokit.repos.getContent({ owner: 'kryptik-dev', repo, path: repoPath, ref: branch })).data.sha,
        branch,
      });
    } catch (e) { console.error('Failed to delete temp file from GitHub:', e); }
  }, 24 * 60 * 60 * 1000);
  return `https://raw.githubusercontent.com/kryptik-dev/${repo}/${branch}/_temp/${fileName}`;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'tiktok') {
    const url = interaction.options.getString('url');
    const botName = client.user.username;
    const userMention = `<@${interaction.user.id}>`;
    await interaction.deferReply();
    const statusMsg = getRandomStatus(botName, 'tiktok');
    await interaction.editReply({ content: statusMsg });

    if (!/^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|m\.tiktok\.com|v\.douyin\.com)\//.test(url)) {
      await interaction.editReply('Please provide a valid TikTok URL.');
      return;
    }

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      try {
        const blocker = await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch);
        await blocker.enableBlockingInPage(page);
      } catch (e) {
        console.warn('Adblocker failed to initialize:', e);
      }
      await page.goto('https://snaptik.app/en2', { waitUntil: 'networkidle2' });

      try {
        await page.waitForSelector('button.continue-web', { timeout: 5000 });
        await page.click('button.continue-web');
        await page.waitForTimeout(500);
      } catch (e) {
      }

      await page.waitForSelector('form[name="formurl"] #url', { timeout: 10000 });
      await page.$eval('form[name="formurl"] #url', (el, value) => { el.value = value; }, url);
      await page.click('form[name="formurl"] button[type="submit"]');

      try {
        await page.waitForSelector('#download .button.is-success', { timeout: 10000 });
        await page.click('#download .button.is-success');
        await page.waitForTimeout(1000);
      } catch (e) {
      }

      try {
        await page.waitForSelector('a.button.download-file', { timeout: 15000 });
      } catch (timeoutErr) {
        await page.screenshot({ path: 'snaptik_debug.png', fullPage: true });
        await browser.close();
        await interaction.editReply('Failed to get the download link. Screenshot saved as snaptik_debug.png for debugging.');
        return;
      }

      const links = await page.$$eval('a.button.download-file', as =>
        as.map(a => a.href).filter(href => href && (href.endsWith('.mp4') || href.includes('rapidcdn.app')))
      );

      await browser.close();

      if (links.length > 0) {
        const videoUrl = links[0];
        const filePath = path.join(__dirname, 'video.mp4');
        const compressedPath = path.join(__dirname, 'video_compressed.mp4');

        try {
          const response = await axios.get(videoUrl, { responseType: 'stream' });
          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });

          let stats = fs.statSync(filePath);
          let fileSizeInMB = stats.size / (1024 * 1024);

          if (stats.size === 0) {
            throw new Error('Downloaded video file is empty!');
          }

          const embed = new EmbedBuilder()
            .setDescription("Here's your video cutie")
            .setColor(0x1da1f2);

          if (fileSizeInMB <= 8) {
            try {
              await interaction.editReply({
                content: `${userMention} your media is ready!`,
                embeds: [embed],
                files: [filePath]
              });
            } catch (err) {
              if (err.code === 10008) {
                await interaction.followUp({
                  content: `${userMention} your media is ready!`,
                  embeds: [embed],
                  files: [filePath]
                });
              } else {
                console.error('Discord reply error:', err);
              }
            }
            setTimeout(() => {
              try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
            }, 1000);
          } else {
            let scale = 0.8;
            let bitrate = 800;
            let attempts = 0;
            const minBitrate = 200;
            let minHeight = 480;
            while (fileSizeInMB > 8 && bitrate >= minBitrate && attempts < 5) {
              // Get current video height
              let videoHeight = 0;
              try {
                videoHeight = await new Promise((resolve, reject) => {
                  ffmpeg.ffprobe(filePath, (err, metadata) => {
                    if (err) return resolve(0);
                    resolve(metadata.streams[0].height || 0);
                  });
                });
              } catch (e) {}
              if (videoHeight <= minHeight) break;
              let scaleFactor = Math.max(minHeight / videoHeight, scale);
              await new Promise((resolve, reject) => {
                ffmpeg(filePath)
                  .outputOptions([
                    '-vf', `scale='trunc(iw*${scaleFactor}/2)*2:trunc(ih*${scaleFactor}/2)*2'`,
                    '-b:v', `${bitrate}k`,
                    '-bufsize', `${bitrate}k`,
                    '-preset', 'fast'
                  ])
                  .on('end', resolve)
                  .on('error', (err, stdout, stderr) => {
                    console.error('FFmpeg error:', err);
                    console.error('FFmpeg stderr:', stderr);
                    reject(err);
                  })
                  .save(compressedPath);
              });
              stats = fs.statSync(compressedPath);
              fileSizeInMB = stats.size / (1024 * 1024);
              scaleFactor -= 0.1;
              bitrate -= 100;
              attempts += 1;
              fs.unlinkSync(filePath);
              fs.renameSync(compressedPath, filePath);
            }

            if (fileSizeInMB <= 8) {
              try {
                await interaction.editReply({
                  content: `${userMention} your media is ready!`,
                  embeds: [embed],
                  files: [filePath]
                });
              } catch (err) {
                if (err.code === 10008) {
                  await interaction.followUp({
                    content: `${userMention} your media is ready!`,
                    embeds: [embed],
                    files: [filePath]
                  });
                } else {
                  console.error('Discord reply error:', err);
                }
              }
              setTimeout(() => {
                try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
              }, 1000);
            } else {
              embed.setDescription(`Even after multiple compressions, the video is too large (${fileSizeInMB.toFixed(2)} MB). [Download it here](${videoUrl})`);
              try {
                await interaction.editReply({ content: `${userMention} your media is ready!`, embeds: [embed] });
              } catch (err) {
                if (err.code === 10008) {
                  await interaction.followUp({ content: `${userMention} your media is ready!`, embeds: [embed] });
                } else {
                  console.error('Discord reply error:', err);
                }
              }
            }
            setTimeout(() => {
              try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
              try { if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath); } catch (e) {}
            }, 1000);
          }
        } catch (err) {
          console.error(err);
          const embed = new EmbedBuilder()
            .setDescription('Failed to download, compress, or upload the video.')
            .setColor(0xff0000);
          try {
            await interaction.editReply({ content: `${userMention} your media is ready!`, embeds: [embed] });
          } catch (err) {
            if (err.code === 10008) {
              await interaction.followUp({ content: `${userMention} your media is ready!`, embeds: [embed] });
            } else {
              console.error('Discord reply error:', err);
            }
          }
          setTimeout(() => {
            try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
            try { if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath); } catch (e) {}
          }, 1000);
        }
      } else {
        const embed = new EmbedBuilder()
          .setDescription('Failed to get the download link. Try again later.')
          .setColor(0xff0000);
        try {
          await interaction.editReply({ embeds: [embed], content: null });
        } catch (err) {
          if (err.code === 10008) {
            await interaction.followUp({ embeds: [embed], content: null });
          } else {
            console.error('Discord reply error:', err);
          }
        }
      }
    } catch (err) {
      console.error(err);
      try {
        await interaction.editReply('An error occurred while processing your request.');
      } catch (err) {
        if (err.code === 10008) {
          await interaction.followUp('An error occurred while processing your request.');
        } else {
          console.error('Discord reply error:', err);
        }
      }
    }
  }
  if (interaction.commandName === 'instagram') {
    const url = interaction.options.getString('url');
    const botName = client.user.username;
    const userMention = `<@${interaction.user.id}>`;
    await interaction.deferReply();
    const statusMsg = getRandomStatus(botName, 'instagram');
    await interaction.editReply({ content: statusMsg });

    if (!/^https?:\/\/(www\.)?(instagram\.com|www\.instagram\.com|instagr\.am)\//.test(url)) {
      await interaction.editReply('Please provide a valid Instagram URL.');
      return;
    }

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      try {
        const blocker = await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch);
        await blocker.enableBlockingInPage(page);
      } catch (e) {
        console.warn('Adblocker failed to initialize:', e);
      }
      await page.goto('https://snapins.ai/', { waitUntil: 'networkidle2' });

      try {
        await page.waitForSelector('button', { timeout: 5000 });
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text && text.trim().toLowerCase() === 'close') {
            await btn.click();
            break;
          }
        }
        await page.waitForTimeout(500);
      } catch (e) {
      }

      try {
        const langBtn = await page.$('button[aria-haspopup="listbox"]');
        if (langBtn) {
          const langText = await page.evaluate(el => el.textContent, langBtn);
          if (!langText.toLowerCase().includes('english')) {
            await langBtn.click();
            await page.waitForSelector('li[role="option"]', { timeout: 5000 });
            const options = await page.$$('li[role="option"]');
            for (const opt of options) {
              const text = await page.evaluate(el => el.textContent, opt);
              if (text && text.toLowerCase().includes('english')) {
                await opt.click();
                break;
              }
            }
            await page.waitForTimeout(500);
          }
        }
      } catch (e) {
      }

      await page.waitForSelector('input[type="text"]', { timeout: 10000 });
      await page.$eval('input[type="text"]', (el, value) => { el.value = value; }, url);
      await page.click('#submit-btn');

      let mediaUrl;
      try {
        await page.waitForSelector('a.bg-blue-600[href*="rapidcdn.app"]', { timeout: 15000 });
        mediaUrl = await page.$eval('a.bg-blue-600[href*="rapidcdn.app"]', a => a.href);
      } catch (timeoutErr) {
        await page.screenshot({ path: 'snapins_debug.png', fullPage: true });
        await browser.close();
        await interaction.editReply('Failed to get the download link. Screenshot saved as snapins_debug.png for debugging.');
        return;
      }
      await browser.close();

      if (mediaUrl) {
        let ext = '.mp4';
        let contentType = '';
        try {
          const headResp = await axios.head(mediaUrl);
          contentType = headResp.headers['content-type'] || '';
        } catch (e) {}
        if (contentType.startsWith('image/')) {
          if (contentType.includes('jpeg')) ext = '.jpg';
          else if (contentType.includes('png')) ext = '.png';
          else if (contentType.includes('gif')) ext = '.gif';
        } else if (contentType.startsWith('video/')) {
          ext = '.mp4';
        } else if (mediaUrl.match(/\.(jpg|jpeg|png|gif)/i)) {
          ext = '.' + mediaUrl.split('.').pop().split('?')[0];
        }
        const filePath = path.join(__dirname, 'ig_media' + ext);
        const compressedPath = path.join(__dirname, 'ig_media_compressed' + ext);

        try {
          const response = await axios.get(mediaUrl, { responseType: 'stream' });
          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });

          let stats = fs.statSync(filePath);
          let fileSizeInMB = stats.size / (1024 * 1024);

          if (stats.size === 0) {
            throw new Error('Downloaded media file is empty!');
          }

          const embed = new EmbedBuilder()
            .setDescription("Here's your Instagram media cutie")
            .setColor(0xe1306c);

          if (fileSizeInMB <= 8) {
            try {
              await interaction.editReply({
                content: `${userMention} your media is ready!`,
                embeds: [embed],
                files: [filePath]
              });
            } catch (err) {
              if (err.code === 10008) {
                await interaction.followUp({
                  content: `${userMention} your media is ready!`,
                  embeds: [embed],
                  files: [filePath]
                });
              } else {
                console.error('Discord reply error:', err);
              }
            }
            setTimeout(() => {
              try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
            }, 1000);
          } else if (ext === '.mp4') {
            let scale = 0.8;
            let bitrate = 800;
            let attempts = 0;
            const minScale = 0.3;
            const minBitrate = 200;
            while (fileSizeInMB > 8 && scale >= minScale && bitrate >= minBitrate && attempts < 5) {
              await new Promise((resolve, reject) => {
                ffmpeg(filePath)
                  .outputOptions([
                    '-vf', `scale='trunc(iw*${scale}/2)*2:trunc(ih*${scale}/2)*2'`,
                    '-b:v', `${bitrate}k`,
                    '-bufsize', `${bitrate}k`,
                    '-preset', 'fast'
                  ])
                  .on('end', resolve)
                  .on('error', (err, stdout, stderr) => {
                    console.error('FFmpeg error:', err);
                    console.error('FFmpeg stderr:', stderr);
                    reject(err);
                  })
                  .save(compressedPath);
              });
              stats = fs.statSync(compressedPath);
              fileSizeInMB = stats.size / (1024 * 1024);
              scale -= 0.1;
              bitrate -= 100;
              attempts += 1;
              fs.unlinkSync(filePath);
              fs.renameSync(compressedPath, filePath);
            }
            if (fileSizeInMB <= 8) {
              try {
                await interaction.editReply({
                  content: `${userMention} your media is ready!`,
                  embeds: [embed],
                  files: [filePath]
                });
              } catch (err) {
                if (err.code === 10008) {
                  await interaction.followUp({
                    content: `${userMention} your media is ready!`,
                    embeds: [embed],
                    files: [filePath]
                  });
                } else {
                  console.error('Discord reply error:', err);
                }
              }
              setTimeout(() => {
                try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
              }, 1000);
            } else {
              embed.setDescription(`Even after multiple compressions, the video is too large (${fileSizeInMB.toFixed(2)} MB). [Download it here](${mediaUrl})`);
              try {
                await interaction.editReply({ content: `${userMention} your media is ready!`, embeds: [embed] });
              } catch (err) {
                if (err.code === 10008) {
                  await interaction.followUp({ content: `${userMention} your media is ready!`, embeds: [embed] });
                } else {
                  console.error('Discord reply error:', err);
                }
              }
            }
            setTimeout(() => {
              try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
              if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
            }, 1000);
          } else {
            embed.setDescription(`The image is too large for Discord (${fileSizeInMB.toFixed(2)} MB). [Download it here](${mediaUrl})`);
            try {
              await interaction.editReply({ content: `${userMention} your media is ready!`, embeds: [embed] });
            } catch (err) {
              if (err.code === 10008) {
                await interaction.followUp({ content: `${userMention} your media is ready!`, embeds: [embed] });
              } else {
                console.error('Discord reply error:', err);
              }
            }
            setTimeout(() => {
              try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
            }, 1000);
          }
        } catch (err) {
          console.error(err);
          const embed = new EmbedBuilder()
            .setDescription('Failed to download, compress, or upload the media.')
            .setColor(0xff0000);
          try {
            await interaction.editReply({ content: `${userMention} your media is ready!`, embeds: [embed] });
          } catch (err) {
            if (err.code === 10008) {
              await interaction.followUp({ content: `${userMention} your media is ready!`, embeds: [embed] });
            } else {
              console.error('Discord reply error:', err);
            }
          }
          setTimeout(() => {
            try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
            if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
          }, 1000);
        }
      } else {
        const embed = new EmbedBuilder()
          .setDescription('Failed to get the download link. Try again later.')
          .setColor(0xff0000);
        try {
          await interaction.editReply({ embeds: [embed], content: null });
        } catch (err) {
          if (err.code === 10008) {
            await interaction.followUp({ embeds: [embed], content: null });
          } else {
            console.error('Discord reply error:', err);
          }
        }
      }
    } catch (err) {
      console.error(err);
      try {
        await interaction.editReply('An error occurred while processing your request.');
      } catch (err) {
        if (err.code === 10008) {
          await interaction.followUp('An error occurred while processing your request.');
        } else {
          console.error('Discord reply error:', err);
        }
      }
    }
  }
});

client.login(TOKEN); 