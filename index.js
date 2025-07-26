require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const puppeteer = require('puppeteer');
const { PuppeteerBlocker } = require('@cliqz/adblocker-puppeteer');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public')));

// Tailwind CDN for all HTML
const tailwindCDN = '<script src="https://cdn.tailwindcss.com"></script>';

// Homepage with app cards
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SMVAD - Social Media Video And Audio Downloader</title>
      ${tailwindCDN}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .input-modern { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); }
        .input-modern:focus { outline: none; border-color: rgba(255, 255, 255, 0.5); box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1); }
        .btn-modern { background: linear-gradient(135deg, #000000 0%, #333333 100%); transition: all 0.3s ease; }
        .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); }
        /* Modern flat headings */
        .heading-flat { 
          font-family: 'Inter', sans-serif; 
          font-weight: 800; 
          letter-spacing: -0.025em; 
          text-transform: uppercase;
        }
        .heading-flat-sm { 
          font-family: 'Inter', sans-serif; 
          font-weight: 700; 
          letter-spacing: -0.02em; 
        }
      </style>
    </head>
    <body class="gradient-bg min-h-screen flex flex-col items-center justify-center p-4">
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-4xl md:text-6xl heading-flat text-white mb-6">
          SMVAD
        </h1>
        <p class="text-xl text-white/80 mb-8">Social Media Video And Audio Downloader</p>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        <a href="/tiktok" class="glass-effect rounded-2xl p-8 text-center card-hover group">
          <div class="w-20 h-20 mx-auto mb-6 bg-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <img src="/public/tiktok.png" alt="TikTok" class="w-12 h-12">
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">TikTok</h3>
          <p class="text-white/70 text-sm">Download videos without watermark</p>
        </a>
        
        <a href="/instagram" class="glass-effect rounded-2xl p-8 text-center card-hover group">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <img src="/public/instagram.png" alt="Instagram" class="w-12 h-12">
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">Instagram</h3>
          <p class="text-white/70 text-sm">Download posts, reels & stories</p>
        </a>
        
        <a href="/youtube" class="glass-effect rounded-2xl p-8 text-center card-hover group">
          <div class="w-20 h-20 mx-auto mb-6 bg-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <img src="/public/youtube.png" alt="YouTube" class="w-12 h-12">
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">YouTube</h3>
          <p class="text-white/70 text-sm">Download videos & audio</p>
        </a>
        
        <a href="/spotify" class="glass-effect rounded-2xl p-8 text-center card-hover group">
          <div class="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <img src="/public/spotify.png" alt="Spotify" class="w-12 h-12">
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">Spotify</h3>
          <p class="text-white/70 text-sm">Download tracks as MP3</p>
        </a>
      </div>
      
      <footer class="mt-16 text-white/60 text-center">
        <p>&copy; ${new Date().getFullYear()} SMVAD • Made with ❤️</p>
        <div class="text-center mt-8 text-white/60">
          <p>Made by <a href="https://github.com/kryptik-dev" class="text-white hover:text-green-400 transition-colors">кяуρтιк</a></p>
        </div>
      </footer>
    </body>
    </html>
  `);
});

// TikTok form
app.get('/tiktok', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TikTok Downloader</title>
      ${tailwindCDN}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .input-modern { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); }
        .input-modern:focus { outline: none; border-color: rgba(255, 255, 255, 0.5); box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1); }
        .btn-modern { background: linear-gradient(135deg, #000000 0%, #333333 100%); transition: all 0.3s ease; }
        .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); }
        /* Custom seek bar styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        input[type="range"]::-moz-range-thumb {
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-ms-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        input[type="range"]::-ms-thumb {
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        /* Make seek bar visible on hover */
        .custom-player:hover input[type="range"] {
          opacity: 1 !important;
        }
      </style>
    </head>
    <body class="gradient-bg min-h-screen flex flex-col items-center justify-center p-4">
      <a href="/" class="absolute left-6 top-6 text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Home
      </a>
      
      <div class="glass-effect rounded-3xl p-8 w-full max-w-md animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-20 h-20 mx-auto mb-6 bg-black rounded-2xl flex items-center justify-center">
            <img src="/public/tiktok.png" alt="TikTok" class="w-12 h-12">
          </div>
          <h2 class="text-3xl heading-flat-sm text-white mb-2">TikTok Downloader</h2>
          <p class="text-white/70">Download videos without watermark</p>
        </div>
        
        <form id="tiktokForm" class="space-y-6">
          <div>
            <input 
              name="url" 
              type="url" 
              required 
              placeholder="Paste TikTok video URL here..." 
              class="w-full px-6 py-4 text-white placeholder-white/60 input-modern rounded-2xl text-lg focus:outline-none transition-all duration-300"
            >
          </div>
          <button 
            type="submit" 
            id="submitBtn"
            class="w-full btn-modern text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300"
          >
            Fetch Video
          </button>
        </form>
        
        <!-- Loading Spinner -->
        <div id="loading" class="mt-6 hidden">
          <div class="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6 text-center">
            <div class="flex items-center justify-center mb-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Processing...</h3>
            <p class="text-white/80" id="loadingMessage">Downloading video from TikTok...</p>
          </div>
        </div>
        
        <!-- Video Preview -->
        <div id="videoPreview" class="mt-6 hidden">
          <div class="bg-green-500/20 border border-green-500/30 rounded-2xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4 text-center">Video Preview</h3>
            
            <!-- Custom Video Player -->
            <div class="custom-player relative w-full rounded-xl overflow-hidden mb-4" style="max-height: 400px; background: #000;">
              <video id="previewVideo" class="w-full h-full" style="max-height: 400px;"></video>
              
              <!-- Custom Controls Overlay -->
              <div id="playerControls" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <!-- Progress Bar -->
                <div class="mb-3" id="progressContainer">
                  <div class="relative">
                  <div class="w-full bg-white/30 rounded-full h-1">
                    <div id="progressBar" class="bg-white h-1 rounded-full transition-all duration-100" style="width: 0%"></div>
                    </div>
                    <input id="seekBar" type="range" min="0" max="100" value="0" class="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer">
                  </div>
                </div>
                
                <!-- Control Buttons -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <button id="playPauseBtn" class="text-white hover:text-gray-300 transition-colors">
                      <svg id="playIcon" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <svg id="pauseIcon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                    </button>
                    
                    <div class="text-white text-sm">
                      <span id="currentTime">0:00</span> / <span id="totalTime">0:00</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <button id="muteBtn" class="text-white hover:text-gray-300 transition-colors">
                      <svg id="volumeIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                      <svg id="mutedIcon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      </svg>
                    </button>
                    
                    <button id="fullscreenBtn" class="text-white hover:text-gray-300 transition-colors">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="text-center">
              <a id="downloadBtn" href="#" download="tiktok_video.mp4" class="inline-block bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors">
                Download Video
              </a>
            </div>
          </div>
        </div>
        
        <!-- Error Message -->
        <div id="error" class="mt-6 hidden">
          <div class="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 text-center">
            <h3 class="text-xl font-semibold text-white mb-2">Download Failed</h3>
            <p class="text-white/80" id="errorMessage"></p>
          </div>
        </div>
        
        <script>
          // Wait for DOM to be ready
          document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, setting up form handlers');
            
            const form = document.getElementById('tiktokForm');
            const submitBtn = document.getElementById('submitBtn');
            const loading = document.getElementById('loading');
            const videoPreview = document.getElementById('videoPreview');
            const error = document.getElementById('error');
            const loadingMessage = document.getElementById('loadingMessage');
            const previewVideo = document.getElementById('previewVideo');
            const downloadBtn = document.getElementById('downloadBtn');
            
            // Remove any default form attributes
            form.removeAttribute('action');
            form.removeAttribute('method');
            form.removeAttribute('target');
            
            // Handle form submission
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Form submitted');
              
              // Hide previous results
              videoPreview.classList.add('hidden');
              error.classList.add('hidden');
              
              // Show loading immediately
              submitBtn.disabled = true;
              submitBtn.textContent = 'Processing...';
              loading.classList.remove('hidden');
              loadingMessage.textContent = 'Starting download...';
              
              try {
                const formData = new FormData(form);
                const url = formData.get('url');
                
                console.log('Submitting URL:', url);
                
                const response = await fetch('/tiktok', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ url })
                });
                
                console.log('Response status:', response.status);
                
                if (response.ok) {
                  const data = await response.json();
                  console.log('Response data:', data);
                  
                  // Update loading message
                  loadingMessage.textContent = 'Uploading to GitHub...';
                  
                  // Wait a bit for GitHub upload to complete
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  // Hide loading and show video preview
                  loading.classList.add('hidden');
                  previewVideo.src = data.videoUrl;
                  downloadBtn.href = data.videoUrl;
                  videoPreview.classList.remove('hidden');
                  
                } else {
                  const errorData = await response.json();
                  loading.classList.add('hidden');
                  document.getElementById('errorMessage').textContent = errorData.error || 'Download failed';
                  error.classList.remove('hidden');
                }
              } catch (error) {
                console.error('Error:', error);
                loading.classList.add('hidden');
                document.getElementById('errorMessage').textContent = 'Network error. Please try again.';
                error.classList.remove('hidden');
              } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Fetch Video';
              }
            });
            
            // Also handle button click directly
            submitBtn.addEventListener('click', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Button clicked');
              
              // Trigger form submission
              form.dispatchEvent(new Event('submit'));
            });
            
            console.log('Form handlers set up successfully');
            
            // Custom video player functionality
            const video = document.getElementById('previewVideo');
            const playPauseBtn = document.getElementById('playPauseBtn');
            const playIcon = document.getElementById('playIcon');
            const pauseIcon = document.getElementById('pauseIcon');
            const playerControls = document.getElementById('playerControls');
            const progressBar = document.getElementById('progressBar');
            const currentTime = document.getElementById('currentTime');
            const totalTime = document.getElementById('totalTime');
            const muteBtn = document.getElementById('muteBtn');
            const volumeIcon = document.getElementById('volumeIcon');
            const mutedIcon = document.getElementById('mutedIcon');
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            
            // Debug: Check if elements are found
            console.log('Video element:', video);
            console.log('Mute button:', muteBtn);
            console.log('Fullscreen button:', fullscreenBtn);
            
            // Play/Pause functionality
            function togglePlay() {
              console.log('Toggle play called, video paused:', video.paused);
              if (video.paused) {
                video.play();
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
              } else {
                video.pause();
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
              }
            }
            
            // Event listeners
            playPauseBtn.addEventListener('click', togglePlay);
            
            // Progress bar
            video.addEventListener('timeupdate', () => {
              const progress = (video.currentTime / video.duration) * 100;
              progressBar.style.width = progress + '%';
              currentTime.textContent = formatTime(video.currentTime);
            });
            
            // Make progress bar clickable for seeking
            const seekBar = document.getElementById('seekBar');
            seekBar.addEventListener('input', (e) => {
              const percentage = e.target.value / 100;
              const newTime = percentage * video.duration;
              video.currentTime = newTime;
            });
            
            // Update seek bar when video time changes
            video.addEventListener('timeupdate', () => {
              const progress = (video.currentTime / video.duration) * 100;
              progressBar.style.width = progress + '%';
              seekBar.value = progress;
              currentTime.textContent = formatTime(video.currentTime);
            });
            
            // Total time
            video.addEventListener('loadedmetadata', () => {
              totalTime.textContent = formatTime(video.duration);
            });
            
            // Mute functionality
            muteBtn.addEventListener('click', () => {
              console.log('Mute button clicked');
              video.muted = !video.muted;
              console.log('Video muted:', video.muted);
              if (video.muted) {
                volumeIcon.classList.add('hidden');
                mutedIcon.classList.remove('hidden');
              } else {
                volumeIcon.classList.remove('hidden');
                mutedIcon.classList.add('hidden');
              }
            });
            
            // Fullscreen functionality
            fullscreenBtn.addEventListener('click', () => {
              console.log('Fullscreen button clicked');
              if (document.fullscreenElement) {
                // Exit fullscreen
                if (document.exitFullscreen) {
                  document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                  document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                  document.msExitFullscreen();
                }
              } else {
                // Enter fullscreen
                if (video.requestFullscreen) {
                  video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) {
                  video.webkitRequestFullscreen();
                } else if (video.msRequestFullscreen) {
                  video.msRequestFullscreen();
                }
              }
            });
            
            // Show controls on hover
            const customPlayer = document.querySelector('.custom-player');
            customPlayer.addEventListener('mouseenter', () => {
              playerControls.style.opacity = '1';
            });
            
            customPlayer.addEventListener('mouseleave', () => {
              playerControls.style.opacity = '0';
            });
            
            // Helper function to format time
            function formatTime(seconds) {
              const mins = Math.floor(seconds / 60);
              const secs = Math.floor(seconds % 60);
              return mins + ':' + secs.toString().padStart(2, '0');
            }
          });
        </script>
      </div>
    </body>
    </html>
  `);
});

// Instagram form
app.get('/instagram', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Instagram Downloader</title>
      ${tailwindCDN}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .input-modern { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); }
        .input-modern:focus { outline: none; border-color: rgba(255, 255, 255, 0.5); box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1); }
        .btn-instagram { background: linear-gradient(135deg, #E4405F 0%, #C13584 100%); transition: all 0.3s ease; }
        .btn-instagram:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(228, 64, 95, 0.3); }
        /* Custom seek bar styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        input[type="range"]::-moz-range-thumb {
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-ms-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        input[type="range"]::-ms-thumb {
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        /* Make seek bar visible on hover */
        .custom-player:hover input[type="range"] {
          opacity: 1 !important;
        }
      </style>
    </head>
    <body class="gradient-bg min-h-screen flex flex-col items-center justify-center p-4">
      <a href="/" class="absolute left-6 top-6 text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Home
      </a>
      
      <div class="glass-effect rounded-3xl p-8 w-full max-w-md animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <img src="/public/instagram.png" alt="Instagram" class="w-12 h-12">
          </div>
          <h2 class="text-3xl heading-flat-sm text-white mb-2">Instagram Downloader</h2>
          <p class="text-white/70">Download posts, reels & stories</p>
        </div>
        
        <form id="instagramForm" class="space-y-6">
          <div>
            <input 
              name="url" 
              type="url" 
              required 
              placeholder="Paste Instagram URL here..." 
              class="w-full px-6 py-4 text-white placeholder-white/60 input-modern rounded-2xl text-lg focus:outline-none transition-all duration-300"
            >
          </div>
          <button 
            type="submit" 
            id="submitBtn"
            class="w-full btn-instagram text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300"
          >
            Fetch Media
          </button>
        </form>
        
        <!-- Loading Spinner -->
        <div id="loading" class="mt-6 hidden">
          <div class="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6 text-center">
            <div class="flex items-center justify-center mb-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Processing...</h3>
            <p class="text-white/80" id="loadingMessage">Fetching media from Instagram...</p>
          </div>
        </div>
        
        <!-- Media Preview -->
        <div id="mediaPreview" class="mt-6 hidden">
          <div class="bg-green-500/20 border border-green-500/30 rounded-2xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4 text-center">Media Preview</h3>
            
            <!-- Image Preview -->
            <div id="imagePreview" class="hidden mb-4">
              <img id="previewImage" class="w-full rounded-xl" alt="Instagram Media">
            </div>
            
            <!-- Video Preview -->
            <div id="videoPreview" class="hidden mb-4">
              <video id="previewVideo" class="w-full rounded-xl" controls></video>
            </div>
            
            <div class="text-center">
              <a id="downloadBtn" href="#" download="instagram_media" class="inline-block bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors">
                Download Media
              </a>
            </div>
          </div>
        </div>
        
        <!-- Error Message -->
        <div id="error" class="mt-6 hidden">
          <div class="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 text-center">
            <h3 class="text-xl font-semibold text-white mb-2">Download Failed</h3>
            <p class="text-white/80" id="errorMessage"></p>
          </div>
        </div>
        
        <script>
          // Wait for DOM to be ready
          document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, setting up Instagram form handlers');
            
            const form = document.getElementById('instagramForm');
            const submitBtn = document.getElementById('submitBtn');
            const loading = document.getElementById('loading');
            const mediaPreview = document.getElementById('mediaPreview');
            const imagePreview = document.getElementById('imagePreview');
            const videoPreview = document.getElementById('videoPreview');
            const error = document.getElementById('error');
            const loadingMessage = document.getElementById('loadingMessage');
            
            // Remove any default form attributes
            form.removeAttribute('action');
            form.removeAttribute('method');
            form.removeAttribute('target');
            
            // Handle form submission
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Instagram form submitted');
              
              // Hide previous results
              mediaPreview.classList.add('hidden');
              error.classList.add('hidden');
              
              // Show loading immediately
              submitBtn.disabled = true;
              submitBtn.textContent = 'Processing...';
              loading.classList.remove('hidden');
              loadingMessage.textContent = 'Fetching media from Instagram...';
              
              try {
                const formData = new FormData(form);
                const url = formData.get('url');
                
                console.log('Submitting URL:', url);
                
                const response = await fetch('/instagram', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ url })
                });
                
                console.log('Response status:', response.status);
                
                if (response.ok) {
                  const data = await response.json();
                  console.log('Response data:', data);
                  
                  // Hide loading and show preview
                  loading.classList.add('hidden');
                  
                  const downloadBtn = document.getElementById('downloadBtn');
                  downloadBtn.href = data.downloadUrl;
                  
                  // Determine if it's image or video and show appropriate preview
                  if (data.mediaType === 'image') {
                    const previewImage = document.getElementById('previewImage');
                    previewImage.src = data.downloadUrl;
                    imagePreview.classList.remove('hidden');
                    videoPreview.classList.add('hidden');
                  } else {
                    const previewVideo = document.getElementById('previewVideo');
                    previewVideo.src = data.downloadUrl;
                    videoPreview.classList.remove('hidden');
                    imagePreview.classList.add('hidden');
                  }
                  
                  mediaPreview.classList.remove('hidden');
                  
                } else {
                  const errorData = await response.json();
                  loading.classList.add('hidden');
                  document.getElementById('errorMessage').textContent = errorData.error || 'Download failed';
                  error.classList.remove('hidden');
                }
              } catch (error) {
                console.error('Error:', error);
                loading.classList.add('hidden');
                document.getElementById('errorMessage').textContent = 'Network error. Please try again.';
                error.classList.remove('hidden');
              } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Fetch Media';
              }
            });
            
            console.log('Instagram form handlers set up successfully');
          });
        </script>
      </div>
    </body>
    </html>
  `);
});

// YouTube form
app.get('/youtube', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>YouTube Downloader</title>
      ${tailwindCDN}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .input-modern { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); }
        .input-modern:focus { outline: none; border-color: rgba(255, 255, 255, 0.5); box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1); }
        .select-modern { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); color: white; }
        .select-modern:focus { outline: none; border-color: rgba(255, 255, 255, 0.5); box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1); }
        .btn-youtube { background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%); transition: all 0.3s ease; }
        .btn-youtube:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(255, 0, 0, 0.3); }
        /* Custom seek bar styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        input[type="range"]::-moz-range-thumb {
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-ms-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        input[type="range"]::-ms-thumb {
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        /* Make seek bar visible on hover */
        .custom-player:hover input[type="range"] {
          opacity: 1 !important;
        }
      </style>
    </head>
    <body class="gradient-bg min-h-screen flex flex-col items-center justify-center p-4">
      <a href="/" class="absolute left-6 top-6 text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Home
      </a>
      
      <div class="glass-effect rounded-3xl p-8 w-full max-w-md animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-20 h-20 mx-auto mb-6 bg-red-600 rounded-2xl flex items-center justify-center">
            <img src="/public/youtube.png" alt="YouTube" class="w-12 h-12">
          </div>
          <h2 class="text-3xl heading-flat-sm text-white mb-2">YouTube Downloader</h2>
          <p class="text-white/70">Download videos & audio</p>
        </div>
        
        <form id="youtubeForm" class="space-y-6">
          <div>
            <input 
              name="url" 
              type="url" 
              required 
              placeholder="Paste YouTube URL here..." 
              class="w-full px-6 py-4 text-white placeholder-white/60 input-modern rounded-2xl text-lg focus:outline-none transition-all duration-300"
            >
          </div>
          <div class="mb-6">
            <label class="block text-white text-lg font-semibold mb-4 text-center">Download Type</label>
            <div class="flex space-x-4 justify-center">
              <label class="flex items-center cursor-pointer">
                <input type="radio" name="type" value="video" class="hidden" checked>
                <div class="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center mr-3 transition-all duration-200">
                  <div class="w-3 h-3 bg-white rounded-full opacity-0 transition-all duration-200"></div>
                </div>
                <span class="text-white font-medium">Video</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input type="radio" name="type" value="audio" class="hidden">
                <div class="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center mr-3 transition-all duration-200">
                  <div class="w-3 h-3 bg-white rounded-full opacity-0 transition-all duration-200"></div>
                </div>
                <span class="text-white font-medium">Audio (MP3)</span>
              </label>
            </div>
          </div>
          <button 
            type="submit" 
            id="submitBtn"
            class="w-full btn-youtube text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300"
          >
            Fetch Media
          </button>
        </form>
        
        <!-- Loading Spinner -->
        <div id="loading" class="mt-6 hidden">
          <div class="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6 text-center">
            <div class="flex items-center justify-center mb-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Processing...</h3>
            <p class="text-white/80" id="loadingMessage">Fetching media from YouTube...</p>
          </div>
        </div>
        
        <!-- Video Preview -->
        <div id="videoPreview" class="mt-6 hidden">
          <div class="bg-green-500/20 border border-green-500/30 rounded-2xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4 text-center">Video Preview</h3>
            
            <!-- Custom Video Player -->
            <div class="custom-player relative w-full rounded-xl overflow-hidden mb-4" style="max-height: 400px; background: #000;">
              <video id="previewVideo" class="w-full h-full" style="max-height: 400px;"></video>
              
              <!-- Custom Controls Overlay -->
              <div id="playerControls" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <!-- Progress Bar -->
                <div class="mb-3" id="progressContainer">
                  <div class="relative">
                  <div class="w-full bg-white/30 rounded-full h-1">
                    <div id="progressBar" class="bg-white h-1 rounded-full transition-all duration-100" style="width: 0%"></div>
                    </div>
                    <input id="seekBar" type="range" min="0" max="100" value="0" class="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer">
                  </div>
                </div>
                
                <!-- Control Buttons -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <button id="playPauseBtn" class="text-white hover:text-gray-300 transition-colors">
                      <svg id="playIcon" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <svg id="pauseIcon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                    </button>
                    
                    <div class="text-white text-sm">
                      <span id="currentTime">0:00</span> / <span id="totalTime">0:00</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <button id="muteBtn" class="text-white hover:text-gray-300 transition-colors">
                      <svg id="volumeIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                      <svg id="mutedIcon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      </svg>
                    </button>
                    
                    <button id="fullscreenBtn" class="text-white hover:text-gray-300 transition-colors">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="text-center">
              <a id="downloadBtn" href="#" download="youtube_video.mp4" class="inline-block bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors">
                Download Video
              </a>
            </div>
          </div>
        </div>
        
        <!-- Audio Player -->
        <div id="audioPlayer" class="mt-6 hidden">
          <div class="bg-green-500/20 border border-green-500/30 rounded-2xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4 text-center">Audio Preview</h3>
            
            <!-- Custom Audio Player -->
            <div class="bg-gray-800 rounded-xl p-6 mb-4">
              <div class="flex items-center space-x-4 mb-4">
                <div class="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 id="audioTitle" class="text-white font-semibold">Track Title</h4>
                  <p id="audioArtist" class="text-gray-400 text-sm">Artist</p>
                  <p id="audioAlbum" class="text-gray-500 text-xs">Album Name</p>
                </div>
              </div>
              
              <!-- Progress Bar with Seek Thumb -->
              <div class="relative">
                <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div id="progressFill" class="bg-green-500 h-2 rounded-full transition-all duration-100" style="width: 0%"></div>
                </div>
                <input id="seekBar" type="range" min="0" max="100" value="0" class="w-full h-2 bg-transparent rounded-full appearance-none cursor-pointer absolute top-0 left-0">
                <div class="flex justify-between text-xs text-gray-400 mt-2">
                  <span id="currentTime">0:00</span>
                  <span id="totalTime">0:00</span>
                </div>
              </div>
              
              <!-- Control Buttons -->
              <div class="flex items-center justify-center space-x-6">
                <button id="playPauseBtn" class="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 transition-all duration-300">
                  <svg id="playIcon" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  <svg id="pauseIcon" class="w-8 h-8 hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  </button>
                  
                <a id="downloadBtn" href="#" download class="text-white hover:text-gray-300 transition-colors">
                  <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 16l-5-5h3V4h4v7h3l-5 5z"/>
                    <path d="M20 18H4v2h16v-2z"/>
                  </svg>
                </a>
                    </div>
            </div>
          </div>
        </div>
        
        <!-- Error Message -->
        <div id="error" class="mt-6 hidden">
          <div class="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 text-center">
            <h3 class="text-xl font-semibold text-white mb-2">Download Failed</h3>
            <p class="text-white/80" id="errorMessage"></p>
          </div>
        </div>
        
        <script>
          // Wait for DOM to be ready
          document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, setting up YouTube form handlers');
            
            const form = document.getElementById('youtubeForm');
            const submitBtn = document.getElementById('submitBtn');
            const loading = document.getElementById('loading');
            const videoPreview = document.getElementById('videoPreview');
            const audioPlayer = document.getElementById('audioPlayer');
            const error = document.getElementById('error');
            const loadingMessage = document.getElementById('loadingMessage');
            
            // Handle custom radio button styling
            const radioButtons = document.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
              radio.addEventListener('change', function() {
                // Remove active state from all radio buttons
                document.querySelectorAll('input[type="radio"]').forEach(r => {
                  const circle = r.parentElement.querySelector('.w-3.h-3');
                  circle.style.opacity = '0';
                });
                
                // Add active state to selected radio button
                if (this.checked) {
                  const circle = this.parentElement.querySelector('.w-3.h-3');
                  circle.style.opacity = '1';
                }
              });
            });
            
            // Initialize the first radio button as selected
            const firstRadio = document.querySelector('input[type="radio"]');
            if (firstRadio && firstRadio.checked) {
              const circle = firstRadio.parentElement.querySelector('.w-3.h-3');
              circle.style.opacity = '1';
            }
            
            // Remove any default form attributes
            form.removeAttribute('action');
            form.removeAttribute('method');
            form.removeAttribute('target');
            
            // Handle form submission
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('YouTube form submitted');
              
              // Hide previous results
              videoPreview.classList.add('hidden');
              audioPlayer.classList.add('hidden');
              error.classList.add('hidden');
              
              // Show loading immediately
              submitBtn.disabled = true;
              submitBtn.textContent = 'Processing...';
              loading.classList.remove('hidden');
              loadingMessage.textContent = 'Fetching media from YouTube...';
              
              try {
                const formData = new FormData(form);
                const url = formData.get('url');
                const type = formData.get('type');
                
                console.log('Submitting URL:', url, 'Type:', type);
                
                const response = await fetch('/youtube', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ url, type })
                });
                
                console.log('Response status:', response.status);
                
                if (response.ok) {
                  const data = await response.json();
                  console.log('Response data:', data);
                  
                  // Hide loading and show appropriate preview
                  loading.classList.add('hidden');
                  
                  if (type === 'video') {
                    // Show video preview
                    const previewVideo = document.getElementById('previewVideo');
                    const downloadBtn = document.getElementById('downloadBtn');
                    previewVideo.src = data.videoUrl;
                    downloadBtn.href = data.videoUrl;
                    videoPreview.classList.remove('hidden');
                  } else {
                    // Show audio player
                    const audioDownloadBtn = document.getElementById('audioDownloadBtn');
                    audioDownloadBtn.href = data.audioUrl;
                    audioPlayer.classList.remove('hidden');
                  }
                  
                } else {
                  const errorData = await response.json();
                  loading.classList.add('hidden');
                  document.getElementById('errorMessage').textContent = errorData.error || 'Download failed';
                  error.classList.remove('hidden');
                }
              } catch (error) {
                console.error('Error:', error);
                loading.classList.add('hidden');
                document.getElementById('errorMessage').textContent = 'Network error. Please try again.';
                error.classList.remove('hidden');
              } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Fetch Media';
              }
            });
            
            // Custom video player functionality (copied from TikTok)
            const video = document.getElementById('previewVideo');
            const playPauseBtn = document.getElementById('playPauseBtn');
            const playIcon = document.getElementById('playIcon');
            const pauseIcon = document.getElementById('pauseIcon');
            const playerControls = document.getElementById('playerControls');
            const progressBar = document.getElementById('progressBar');
            const currentTime = document.getElementById('currentTime');
            const totalTime = document.getElementById('totalTime');
            const muteBtn = document.getElementById('muteBtn');
            const volumeIcon = document.getElementById('volumeIcon');
            const mutedIcon = document.getElementById('mutedIcon');
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            
            // Debug: Check if elements are found
            console.log('Video element:', video);
            console.log('Mute button:', muteBtn);
            console.log('Fullscreen button:', fullscreenBtn);
            
            // Play/Pause functionality
            function togglePlay() {
              console.log('Toggle play called, video paused:', video.paused);
              if (video.paused) {
                video.play();
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
              } else {
                video.pause();
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
              }
            }
            
            // Event listeners
            playPauseBtn.addEventListener('click', togglePlay);
            
            // Progress bar
            video.addEventListener('timeupdate', () => {
              const progress = (video.currentTime / video.duration) * 100;
              progressBar.style.width = progress + '%';
              currentTime.textContent = formatTime(video.currentTime);
            });
            
            // Make progress bar clickable for seeking
            const seekBar = document.getElementById('seekBar');
            seekBar.addEventListener('input', (e) => {
              const percentage = e.target.value / 100;
              const newTime = percentage * video.duration;
              video.currentTime = newTime;
            });
            
            // Update seek bar when video time changes
            video.addEventListener('timeupdate', () => {
              const progress = (video.currentTime / video.duration) * 100;
              progressBar.style.width = progress + '%';
              seekBar.value = progress;
              currentTime.textContent = formatTime(video.currentTime);
            });
            
            // Total time
            video.addEventListener('loadedmetadata', () => {
              totalTime.textContent = formatTime(video.duration);
            });
            
            // Mute functionality
            muteBtn.addEventListener('click', () => {
              console.log('Mute button clicked');
              video.muted = !video.muted;
              console.log('Video muted:', video.muted);
              if (video.muted) {
                volumeIcon.classList.add('hidden');
                mutedIcon.classList.remove('hidden');
              } else {
                volumeIcon.classList.remove('hidden');
                mutedIcon.classList.add('hidden');
              }
            });
            
            // Fullscreen functionality
            fullscreenBtn.addEventListener('click', () => {
              console.log('Fullscreen button clicked');
              if (document.fullscreenElement) {
                // Exit fullscreen
                if (document.exitFullscreen) {
                  document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                  document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                  document.msExitFullscreen();
                }
              } else {
                // Enter fullscreen
                if (video.requestFullscreen) {
                  video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) {
                  video.webkitRequestFullscreen();
                } else if (video.msRequestFullscreen) {
                  video.msRequestFullscreen();
                }
              }
            });
            
            // Show controls on hover
            const customPlayer = document.querySelector('.custom-player');
            customPlayer.addEventListener('mouseenter', () => {
              playerControls.style.opacity = '1';
            });
            
            customPlayer.addEventListener('mouseleave', () => {
              playerControls.style.opacity = '0';
            });
            
            // Helper function to format time
            function formatTime(seconds) {
              const mins = Math.floor(seconds / 60);
              const secs = Math.floor(seconds % 60);
              return mins + ':' + secs.toString().padStart(2, '0');
            }
            
            console.log('YouTube form handlers set up successfully');
          });
        </script>
      </div>
    </body>
    </html>
  `);
});

// Spotify form
app.get('/spotify', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Spotify Downloader</title>
      ${tailwindCDN}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .input-modern { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); }
        .input-modern:focus { outline: none; border-color: rgba(255, 255, 255, 0.5); box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1); }
        .btn-spotify { background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%); transition: all 0.3s ease; }
        .btn-spotify:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(29, 185, 84, 0.3); }
        /* Custom seek bar styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        input[type="range"]::-moz-range-thumb {
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-ms-track {
          background: transparent;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        input[type="range"]::-ms-thumb {
          background: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        /* Make seek bar visible on hover */
        .custom-player:hover input[type="range"] {
          opacity: 1 !important;
        }
      </style>
    </head>
    <body class="gradient-bg min-h-screen flex flex-col items-center justify-center p-4">
      <a href="/" class="absolute left-6 top-6 text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Home
      </a>
      
      <div class="glass-effect rounded-3xl p-8 w-full max-w-md animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-2xl flex items-center justify-center">
            <img src="/public/spotify.png" alt="Spotify" class="w-12 h-12">
          </div>
          <h2 class="text-3xl heading-flat-sm text-white mb-2">Spotify Downloader</h2>
          <p class="text-white/70">Download tracks as MP3</p>
        </div>
        
        <form id="spotifyForm" class="space-y-6">
          <div>
            <input 
              name="url" 
              type="url" 
              required 
              placeholder="Paste Spotify track URL here..." 
              class="w-full px-6 py-4 text-white placeholder-white/60 input-modern rounded-2xl text-lg focus:outline-none transition-all duration-300"
            >
          </div>
          <button 
            type="submit" 
            id="submitBtn"
            class="w-full btn-spotify text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300"
          >
            Fetch Track
          </button>
        </form>
        
        <!-- Loading Spinner -->
        <div id="loading" class="mt-6 hidden">
          <div class="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6 text-center">
            <div class="flex items-center justify-center mb-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Processing...</h3>
            <p class="text-white/80" id="loadingMessage">Fetching track from Spotify...</p>
          </div>
        </div>
        
        <!-- Custom Audio Player -->
        <div id="audioPlayer" class="mt-6 hidden">
          <div class="bg-green-500/20 border border-green-500/30 rounded-2xl p-6">
            <h3 class="text-xl font-semibold text-white mb-4 text-center">Track Preview</h3>
            
            <!-- Spotify-style Audio Player -->
            <div class="bg-gray-900 rounded-xl p-6 mb-4">
              <!-- Album Art and Track Info -->
              <div class="flex items-center space-x-4 mb-6">
                <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <img id="albumArt" src="" alt="Album Art" class="w-full h-full object-cover rounded-lg hidden">
                  <svg id="defaultAlbumIcon" class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 id="trackTitle" class="text-white font-bold text-lg">Track Title</h4>
                  <p id="trackArtist" class="text-gray-400 text-sm">Artist Name</p>
                  <p id="trackAlbum" class="text-gray-500 text-xs">Album Name</p>
                </div>
              </div>
              
              <!-- Progress Bar with Seek Thumb -->
                <div class="relative">
                <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div id="progressFill" class="bg-green-500 h-2 rounded-full transition-all duration-100" style="width: 0%"></div>
                  </div>
                <input id="seekBar" type="range" min="0" max="100" value="0" class="w-full h-2 bg-transparent rounded-full appearance-none cursor-pointer absolute top-0 left-0">
                  <div class="flex justify-between text-xs text-gray-400 mt-2">
                    <span id="currentTime">0:00</span>
                    <span id="totalTime">0:00</span>
                  </div>
                </div>
                
                <!-- Control Buttons -->
                <div class="flex items-center justify-center space-x-6">
                  <button id="playPauseBtn" class="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 transition-all duration-300">
                    <svg id="playIcon" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg id="pauseIcon" class="w-8 h-8 hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  </button>
                  
                <a id="downloadBtn" href="#" download class="text-white hover:text-gray-300 transition-colors">
                  <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 16l-5-5h3V4h4v7h3l-5 5z"/>
                    <path d="M20 18H4v2h16v-2z"/>
                    </svg>
                </a>
                </div>
            </div>
          </div>
        </div>
        
        <!-- Error Message -->
        <div id="error" class="mt-6 hidden">
          <div class="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 text-center">
            <h3 class="text-xl font-semibold text-white mb-2">Download Failed</h3>
            <p class="text-white/80" id="errorMessage"></p>
          </div>
        </div>
        
        <script>
          // Wait for DOM to be ready
          document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, setting up Spotify form handlers');
            
            const form = document.getElementById('spotifyForm');
            const submitBtn = document.getElementById('submitBtn');
            const loading = document.getElementById('loading');
            const audioPlayer = document.getElementById('audioPlayer');
            const error = document.getElementById('error');
            const loadingMessage = document.getElementById('loadingMessage');
            
            // Remove any default form attributes
            form.removeAttribute('action');
            form.removeAttribute('method');
            form.removeAttribute('target');
            
            // Handle form submission
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Spotify form submitted');
              
              // Hide previous results
              audioPlayer.classList.add('hidden');
              error.classList.add('hidden');
              
              // Show loading immediately
              submitBtn.disabled = true;
              submitBtn.textContent = 'Processing...';
              loading.classList.remove('hidden');
              loadingMessage.textContent = 'Fetching track from Spotify...';
              
              try {
                const formData = new FormData(form);
                const url = formData.get('url');
                
                console.log('Submitting URL:', url);
                
                const response = await fetch('/spotify', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ url })
                });
                
                console.log('Response status:', response.status);
                
                if (response.ok) {
                  const data = await response.json();
                  console.log('Response data:', data);
                  
                  // Hide loading and show audio player
                  loading.classList.add('hidden');
                  
                  // Update track info
                  document.getElementById('trackTitle').textContent = data.trackTitle || 'Track Title';
                  document.getElementById('trackArtist').textContent = data.trackArtist || 'Artist Name';
                  document.getElementById('trackAlbum').textContent = data.trackAlbum || 'Album Name';
                  
                  // Update album art
                  const albumArt = document.getElementById('albumArt');
                  const defaultAlbumIcon = document.getElementById('defaultAlbumIcon');
                  if (data.trackArt && data.trackArt.trim() !== '') {
                    albumArt.src = data.trackArt;
                    albumArt.classList.remove('hidden');
                    defaultAlbumIcon.classList.add('hidden');
                  } else {
                    albumArt.classList.add('hidden');
                    defaultAlbumIcon.classList.remove('hidden');
                  }
                  
                  // Set up audio player
                  const audio = new Audio(data.audioUrl);
                  const playPauseBtn = document.getElementById('playPauseBtn');
                  const playIcon = document.getElementById('playIcon');
                  const pauseIcon = document.getElementById('pauseIcon');
                  const seekBar = document.getElementById('seekBar');
                  const currentTime = document.getElementById('currentTime');
                  const totalTime = document.getElementById('totalTime');
                  
                  // Play/Pause functionality
                  playPauseBtn.addEventListener('click', () => {
                    if (audio.paused) {
                      audio.play();
                      playIcon.classList.add('hidden');
                      pauseIcon.classList.remove('hidden');
                    } else {
                      audio.pause();
                      playIcon.classList.remove('hidden');
                      pauseIcon.classList.add('hidden');
                    }
                  });
                  
                  // Seek functionality
                  audio.addEventListener('timeupdate', () => {
                    if (!seekBar.max || audio.duration !== +seekBar.max) seekBar.max = Math.floor(audio.duration);
                    seekBar.value = Math.floor(audio.currentTime);
                    currentTime.textContent = formatTime(audio.currentTime);
                    totalTime.textContent = formatTime(audio.duration);
                    
                    // Update progress fill
                    const progress = (audio.currentTime / audio.duration) * 100;
                    document.getElementById('progressFill').style.width = progress + '%';
                  });
                  seekBar.addEventListener('input', (e) => {
                    audio.currentTime = e.target.value;
                    
                    // Update progress fill on seek
                    const progress = (e.target.value / e.target.max) * 100;
                    document.getElementById('progressFill').style.width = progress + '%';
                  });
                  
                  // Update total time
                  audio.addEventListener('loadedmetadata', () => {
                    totalTime.textContent = formatTime(audio.duration);
                  });
                  
                  // Show the audio player
                  audioPlayer.classList.remove('hidden');
                  
                  // Show the audio player
                  audioPlayer.classList.remove('hidden');
                  
                  // Set download button
                  document.getElementById('downloadBtn').href = data.audioUrl;
                  
                } else {
                  const errorData = await response.json();
                  loading.classList.add('hidden');
                  document.getElementById('errorMessage').textContent = errorData.error || 'Download failed';
                  error.classList.remove('hidden');
                }
              } catch (error) {
                console.error('Error:', error);
                loading.classList.add('hidden');
                document.getElementById('errorMessage').textContent = 'Network error. Please try again.';
                error.classList.remove('hidden');
              } finally {
                submitBtn.textContent = 'Fetch Track';
                submitBtn.disabled = false;
              }
            });
            
            // Helper function to format time
            function formatTime(seconds) {
              const mins = Math.floor(seconds / 60);
              const secs = Math.floor(seconds % 60);
              return mins + ':' + secs.toString().padStart(2, '0');
            }
            
            console.log('Spotify form handlers set up successfully');
          });
        </script>
      </div>
    </body>
    </html>
  `);
});

// POST route handlers for web interface downloads

// TikTok POST handler
app.post('/tiktok', async (req, res) => {
  try {
    const url = req.body.url;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const browser = await puppeteer.launch({ 
      headless: "new",
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://snaptik.app/', { waitUntil: 'networkidle2' });
    
    // Close popup immediately on load
    try {
      await page.click('button.modal-close.is-large');
    } catch (e) {
      // If not found, just continue
    }
    
    await page.$eval('input[name="url"]', (el, value) => { el.value = value; }, url);
    await page.click('button[type="submit"]');
    // Wait for result area before polling for download link
    await page.waitForSelector('.download-links, .result', { timeout: 10000 }).catch(() => {});
    // Fast polling for download link
    let downloadUrl = null;
    for (let i = 0; i < 20; i++) {
      try {
        downloadUrl = await page.$eval('a.button.download-file[href]', el => el.href);
        if (downloadUrl) break;
      } catch (e) {}
      await page.waitForTimeout(100);
    }
    if (!downloadUrl) throw new Error('Download link not found!');

    // Download the video file directly using the extracted URL
    const fileName = `tiktok_${Date.now()}.mp4`;
    const filePath = path.join(__dirname, fileName);
    const writer = fs.createWriteStream(filePath);
    const response = await axios.get(downloadUrl, { responseType: 'stream' });
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    await browser.close();

    // Upload to GitHub /storage/_temp and wait for completion
    const rawUrl = `https://raw.githubusercontent.com/kryptik-dev/SMVADB/storage/_temp/${fileName}`;
    if (octokit && GITHUB_TOKEN) {
      await uploadToGitHubRepo(filePath, 'SMVADB', 'storage'); // await the upload
    }
    
    // Clean up the temporary file
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting temp file:', err);
          else console.log('TikTok temp file deleted successfully');
        });
      }
    }, 1000); // Wait 1 second before deletion

    // Return JSON response with video URL
    res.json({ 
      success: true,
      videoUrl: rawUrl,
      message: 'Video downloaded and uploaded successfully'
    });
  } catch (error) {
    console.error('TikTok download error:', error);
    res.status(500).json({ 
      error: 'Failed to download TikTok video',
      details: error.message 
    });
  }
});

// Instagram POST handler
app.post('/instagram', async (req, res) => {
  try {
    const url = req.body.url;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const browser = await puppeteer.launch({ 
      headless: "new",
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://snapins.ai/', { waitUntil: 'networkidle2' });
    
    // Handle language selection if present
    try {
      await page.waitForSelector('#language-selector', { timeout: 5000 });
      await page.select('#language-selector', 'en');
    } catch (e) {
      // Language selector not found, continue
    }
    
    // Wait for input field and paste URL
    await page.waitForSelector('input[type="text"], input[placeholder*="Instagram"], input[name="url"]', { timeout: 10000 });
    await page.$eval('input[type="text"], input[placeholder*="Instagram"], input[name="url"]', (el, value) => { el.value = value; }, url);
    
    // Click download button
    await page.click('#submit-btn');
    
    // Wait for results and look for download links
    await page.waitForSelector('.download-links, .result, .download-item, a[href*=".mp4"], a[href*=".jpg"]', { timeout: 15000 }).catch(() => {});
    
    // Try multiple selectors for download links
    let downloadUrl = null;
    const selectors = [
      'a.button.download-file[href]',
      'a[href*=".mp4"]',
      'a[href*=".jpg"]',
      'a[href*=".jpeg"]',
      'a[href*=".png"]',
      '.download-item a[href]',
      '.result a[href]',
      'a[download]',
      '.download-button[href]',
      'a[href*="cdn"]'
    ];
    
    for (let i = 0; i < 30; i++) {
      for (const selector of selectors) {
        try {
          downloadUrl = await page.$eval(selector, el => el.href);
          if (downloadUrl && downloadUrl !== '#' && downloadUrl !== 'javascript:void(0)') {
            console.log('Found download URL:', downloadUrl);
            break;
          }
        } catch (e) {}
      }
        if (downloadUrl) break;
      await page.waitForTimeout(200);
    }
    
    if (!downloadUrl) {
      // Try to get any link that might be a download
      try {
        const allLinks = await page.$$eval('a[href]', links => 
          links.map(link => link.href).filter(href => 
            href.includes('.mp4') || href.includes('.jpg') || href.includes('.jpeg') || href.includes('.png')
          )
        );
        if (allLinks.length > 0) {
          downloadUrl = allLinks[0];
          console.log('Found download URL from all links:', downloadUrl);
        }
      } catch (e) {}
    }
    
    if (!downloadUrl) throw new Error('Download link not found!');
    await browser.close();

    // Download the media file
    const fileName = `instagram_${Date.now()}.mp4`;
    const filePath = path.join(__dirname, fileName);
    const writer = fs.createWriteStream(filePath);
    const response = await axios.get(downloadUrl, { responseType: 'stream' });
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Determine media type based on file extension or content
    let mediaType = 'video';
    if (downloadUrl.includes('.jpg') || downloadUrl.includes('.jpeg') || downloadUrl.includes('.png')) {
      mediaType = 'image';
    }

    // Upload to GitHub and get the raw URL
    const rawUrl = `https://raw.githubusercontent.com/kryptik-dev/SMVADB/storage/_temp/${fileName}`;
    if (octokit && GITHUB_TOKEN) {
      await uploadToGitHubRepo(filePath, 'SMVADB', 'storage');
    }
    
    // Clean up the temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    res.json({ 
      success: true, 
      downloadUrl: rawUrl,
      mediaType: mediaType,
      message: 'Instagram media downloaded successfully!'
    });
  } catch (error) {
    console.error('Instagram download error:', error);
    res.status(500).json({ 
      error: 'Failed to download Instagram media',
      details: error.message 
    });
  }
});

// YouTube POST handler
app.post('/youtube', async (req, res) => {
  try {
    const { url, type } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const fileName = `youtube_${Date.now()}`;
    const ffmpegPath = require('ffmpeg-static');
    let filePath, finalFileName;

    function runYtDlp(args) {
      return new Promise((resolve, reject) => {
        const ytDlpPath = path.join(__dirname, 'yt-dlp.exe');
        execFile(ytDlpPath, args, (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve(stdout);
        });
      });
    }

    if (type === 'video') {
      finalFileName = `${fileName}.mp4`;
      filePath = path.join(__dirname, finalFileName);
      await runYtDlp(['--ffmpeg-location', ffmpegPath, '-f', 'mp4', '-o', filePath, url]);
    } else {
      finalFileName = `${fileName}.mp3`;
      filePath = path.join(__dirname, finalFileName);
      await runYtDlp(['--ffmpeg-location', ffmpegPath, '-x', '--audio-format', 'mp3', '-o', filePath, url]);
    }

    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);

    // Always upload to GitHub and return JSON response
    if (octokit && GITHUB_TOKEN) {
      const githubUrl = await uploadToGitHubRepo(filePath, 'SMVADB', 'storage');
      
      // Clean up the temporary file
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
      
      if (type === 'video') {
        res.json({ 
          success: true,
          videoUrl: githubUrl,
          message: 'Video uploaded successfully'
        });
      } else {
        res.json({ 
          success: true,
          audioUrl: githubUrl,
          message: 'Audio uploaded successfully'
        });
      }
    } else {
      res.status(500).json({ 
        error: 'GitHub upload not configured',
        details: 'GitHub token not available'
      });
    }
  } catch (error) {
    console.error('YouTube download error:', error);
    res.status(500).json({ 
      error: 'Failed to download YouTube media',
      details: error.message 
    });
  }
});

// Spotify POST handler
app.post('/spotify', async (req, res) => {
  try {
    const url = req.body.url;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

      const browser = await puppeteer.launch({ 
      headless: "new",
      slowMo: 100,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
      });
      const page = await browser.newPage();
        await page.goto('https://spotmate.online/en', { waitUntil: 'networkidle2' });

    // 1. Paste the link into the input
    await page.waitForSelector('#trackUrl', { timeout: 10000 });
    await page.evaluate((url) => {
      document.querySelector('#trackUrl').value = url;
    }, url);

    // 2. Click the Start button
    try {
      await page.waitForSelector('#btnSubmit', { timeout: 10000 });
      await page.click('#btnSubmit');
      } catch (error) {
      console.log('Direct click failed, trying evaluate click');
      await page.evaluate(() => {
        const btn = document.querySelector('#btnSubmit');
        if (btn) btn.click();
      });
    }

    // 2.5. Intercept the /getTrackData fetch response and extract song info
    let trackDataJson = null;
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/getTrackData')) {
        try {
          const json = await response.json();
          trackDataJson = json;
        } catch (e) {}
      }
    });

    // After clicking Start, wait for the JSON to be set
    for (let i = 0; i < 100; i++) {
      if (trackDataJson) break;
      await new Promise(r => setTimeout(r, 100));
    }
    const songInfo = trackDataJson
      ? {
          title: trackDataJson.name || '',
          artist: (trackDataJson.artists && trackDataJson.artists[0] && trackDataJson.artists[0].name) || '',
          artistUrl: (trackDataJson.artists && trackDataJson.artists[0] && trackDataJson.artists[0].external_urls && trackDataJson.artists[0].external_urls.spotify) || '',
          album: (trackDataJson.album && trackDataJson.album.name) || '',
          albumUrl: (trackDataJson.album && trackDataJson.album.external_urls && trackDataJson.album.external_urls.spotify) || '',
          art: (trackDataJson.album && trackDataJson.album.images && trackDataJson.album.images[0] && trackDataJson.album.images[0].url) || '',
          trackUrl: (trackDataJson.external_urls && trackDataJson.external_urls.spotify) || ''
        }
      : { title: '', artist: '', artistUrl: '', album: '', albumUrl: '', art: '', trackUrl: '' };

    // 3. Wait for and click the green Convert button
    try {
      await page.waitForSelector('button.btn-success', { timeout: 20000 });
      await page.click('button.btn-success');
    } catch (error) {
      console.log('Convert button click failed, trying alternative');
      await page.evaluate(() => {
        const convertBtn = document.querySelector('button.btn-success');
        if (convertBtn) convertBtn.click();
      });
    }

    // 4. Wait for the correct download link to appear (with data-url)
    await page.waitForFunction(() => {
      const links = Array.from(document.querySelectorAll('a[data-url]'));
      return links.some(a => a.textContent && a.textContent.trim().toLowerCase() === 'download');
    }, { timeout: 30000 });

    // Extract the real download URL from the data-url attribute
    const realDownloadUrl = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[data-url]'));
      const downloadLink = links.find(a => a.textContent && a.textContent.trim().toLowerCase() === 'download');
      return downloadLink ? downloadLink.getAttribute('data-url') : null;
    });
    if (!realDownloadUrl) {
      throw new Error('Could not find the real download URL in data-url attribute');
    }

    // 5. Download the MP3 file directly using the extracted URL
    const fileName = `spotify_${Date.now()}.mp3`;
      const filePath = path.join(__dirname, fileName);
      const writer = fs.createWriteStream(filePath);
    const response = await axios.get(realDownloadUrl, { responseType: 'stream' });
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    await browser.close();

    // 6. Upload to GitHub and return the link
    if (octokit && GITHUB_TOKEN) {
      const githubUrl = await uploadToGitHubRepo(filePath, 'SMVADB', 'storage');
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
      
      // Schedule file deletion after 5 minutes
      setTimeout(async () => {
        await deleteGitHubFile(filePath, 'SMVADB', 'storage');
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
      
      res.json({
        success: true,
        audioUrl: githubUrl,
        trackTitle: songInfo.title,
        trackArtist: songInfo.artist,
        trackArtistUrl: songInfo.artistUrl,
        trackAlbum: songInfo.album,
        trackAlbumUrl: songInfo.albumUrl,
        trackArt: songInfo.art,
        trackUrl: songInfo.trackUrl,
        message: 'Spotify track downloaded and uploaded successfully!'
        });
      } else {
      res.status(500).json({
        error: 'GitHub upload not configured',
        details: 'GitHub token not available'
      });
    }
  } catch (error) {
    console.error('Spotify download error:', error);
    res.status(500).json({
      error: 'Failed to download Spotify track',
      details: error.message
    });
  }
});

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
const { execFile } = require('child_process');
const { Octokit } = require('@octokit/rest');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Express server setup
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

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
    ),
  new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('Download a YouTube video or audio')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('YouTube video URL')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Download type')
        .setRequired(true)
        .addChoices(
          { name: 'video', value: 'video' },
          { name: 'audio', value: 'audio' }
        )
    ),
  new SlashCommandBuilder()
    .setName('spotify')
    .setDescription('Download a Spotify track as MP3')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Spotify track URL')
        .setRequired(true)
    ),
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

// Add this function after the uploadToGitHubRepo function
async function deleteGitHubFile(filePath, repo, branch = 'storage') {
  try {
    if (!octokit || !GITHUB_TOKEN) {
      console.log('GitHub not configured, skipping file deletion');
      return;
    }
    
    // Extract filename from path
    const fileName = path.basename(filePath);
    
    // Get the file's SHA first
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: 'SMVADB',
      repo: repo,
      path: fileName,
      ref: branch
    });
    
    // Delete the file
    await octokit.rest.repos.deleteFile({
      owner: 'SMVADB',
      repo: repo,
      path: fileName,
      message: `Delete ${fileName} - auto cleanup`,
      sha: fileData.sha,
      branch: branch
    });
    
    console.log(`Deleted ${fileName} from GitHub`);
  } catch (error) {
    console.error('Error deleting file from GitHub:', error.message);
  }
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
      const browser = await puppeteer.launch({
        headless: "new",
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      try {
        const blocker = await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch);
        await blocker.enableBlockingInPage(page);
      } catch (e) {
        console.warn('Adblocker failed to initialize:', e);
      }
      await page.goto('https://snaptik.app/en2', { waitUntil: 'networkidle2' });

      // Close popup immediately on load
      try {
        await page.click('button.modal-close.is-large');
      } catch (e) {
        // If not found, just continue
      }

      try {
        await page.waitForSelector('button.continue-web', { timeout: 5000 });
        await page.click('button.continue-web');
        await page.waitForTimeout(500);
      } catch (e) {
      }

      await page.waitForSelector('form[name="formurl"] #url', { timeout: 10000 });
      await page.$eval('form[name="formurl"] #url', (el, value) => { el.value = value; }, url);
      await page.click('form[name="formurl"] button[type="submit"]');
      // Wait for result area before polling for download link
      await page.waitForSelector('.download-links, .result', { timeout: 10000 }).catch(() => {});
      // Fast polling for download link
      let downloadUrl = null;
      for (let i = 0; i < 20; i++) {
        try {
          downloadUrl = await page.$eval('a.button.download-file[href]', el => el.href);
          if (downloadUrl) break;
        } catch (e) {}
        await page.waitForTimeout(100);
      }
      if (!downloadUrl) throw new Error('Download link not found!');

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
      const browser = await puppeteer.launch({
        headless: "new",
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
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

      await page.waitForSelector('input[type="text"], input[placeholder*="Instagram"], input[name="url"]', { timeout: 10000 });
      await page.$eval('input[type="text"], input[placeholder*="Instagram"], input[name="url"]', (el, value) => { el.value = value; }, url);
      await page.click('#submit-btn');
      
      // Wait for results and look for download links
      await page.waitForSelector('.download-links, .result, .download-item, a[href*=".mp4"], a[href*=".jpg"]', { timeout: 15000 }).catch(() => {});
      
      // Try multiple selectors for download links
      let downloadUrl = null;
      const selectors = [
        'a.button.download-file[href]',
        'a[href*=".mp4"]',
        'a[href*=".jpg"]',
        'a[href*=".jpeg"]',
        'a[href*=".png"]',
        '.download-item a[href]',
        '.result a[href]',
        'a[download]',
        '.download-button[href]',
        'a[href*="cdn"]'
      ];
      
      for (let i = 0; i < 30; i++) {
        for (const selector of selectors) {
          try {
            downloadUrl = await page.$eval(selector, el => el.href);
            if (downloadUrl && downloadUrl !== '#' && downloadUrl !== 'javascript:void(0)') {
              console.log('Found download URL:', downloadUrl);
              break;
            }
          } catch (e) {}
        }
          if (downloadUrl) break;
        await page.waitForTimeout(200);
      }
      
      if (!downloadUrl) {
        // Try to get any link that might be a download
        try {
          const allLinks = await page.$$eval('a[href]', links => 
            links.map(link => link.href).filter(href => 
              href.includes('.mp4') || href.includes('.jpg') || href.includes('.jpeg') || href.includes('.png')
            )
          );
          if (allLinks.length > 0) {
            downloadUrl = allLinks[0];
            console.log('Found download URL from all links:', downloadUrl);
          }
        } catch (e) {}
      }
      
      if (!downloadUrl) throw new Error('Download link not found!');
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
  if (interaction.commandName === 'youtube') {
    const url = interaction.options.getString('url');
    const type = interaction.options.getString('type');
    const botName = client.user.username;
    const userMention = `<@${interaction.user.id}>`;
    await interaction.deferReply();
    const statusMsg = getRandomStatus(botName, 'youtube');
    await interaction.editReply({ content: statusMsg });

    function runYtDlp(args) {
      return new Promise((resolve, reject) => {
        const ytDlpPath = path.join(__dirname, 'yt-dlp.exe');
        execFile(ytDlpPath, args, { windowsHide: true }, (error, stdout, stderr) => {
          if (error) return reject(stderr || error);
          resolve(stdout);
        });
      });
    }

    try {
      const fileName = `${Date.now()}`;
      let filePath;
      let finalFileName;

      if (type === 'video') {
        finalFileName = `${fileName}.mp4`;
        filePath = path.join(__dirname, finalFileName);
        await runYtDlp(['--ffmpeg-location', ffmpegPath, '-f', 'mp4', '-o', filePath, url]);
      } else { // audio
        finalFileName = `${fileName}.mp3`;
        filePath = path.join(__dirname, finalFileName);
        await runYtDlp(['--ffmpeg-location', ffmpegPath, '-x', '--audio-format', 'mp3', '-o', filePath, url]);
      }

      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      const embed = new EmbedBuilder()
        .setDescription(`Here's your YouTube ${type} cutie`)
        .setColor(0xff0000);

      if (fileSizeInMB <= 8) {
        await interaction.editReply({
          content: `${userMention} your media is ready!`,
          embeds: [embed],
          files: [filePath]
        });
      } else {
        if (octokit && GITHUB_TOKEN) {
          const githubUrl = await uploadToGitHubRepo(filePath, 'SMVADB', 'storage');
          embed.setDescription(`Your file is too large for Discord (${fileSizeInMB.toFixed(2)} MB). [Download it here](${githubUrl}) (Link expires in 24 hours)`);
        } else {
          embed.setDescription(`Your file is too large for Discord (${fileSizeInMB.toFixed(2)} MB), and I couldn't upload it to GitHub.`);
        }
        await interaction.editReply({
          content: `${userMention} your media is ready!`,
          embeds: [embed]
        });
      }

      setTimeout(() => {
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
      }, 1000);

    } catch (err) {
      console.error(err);
      const embed = new EmbedBuilder()
        .setDescription('Failed to download or process the YouTube media.')
        .setColor(0xff0000);
      try {
        await interaction.editReply({ content: `${userMention}, something went wrong.`, embeds: [embed] });
      } catch (e) {
        await interaction.followUp({ content: `${userMention}, something went wrong.`, embeds: [embed] });
      }
    }
  }
  if (interaction.commandName === 'spotify') {
    const url = interaction.options.getString('url');
    const botName = client.user.username;
    const userMention = `<@${interaction.user.id}>`;
    await interaction.deferReply();
    const statusMsg = getRandomStatus(botName, 'spotify');
    await interaction.editReply({ content: statusMsg });

    const getSpotmateCsrfAndCookies = async () => {
      const browser = await puppeteer.launch({ 
        headless: "new",
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      try {
        await page.goto('https://spotmate.online/en', { waitUntil: 'networkidle2' });
        
        // Get all cookies
        const cookies = await page.cookies();
        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
        
        // For Laravel applications, we need to extract the XSRF-TOKEN cookie
        const xsrfCookie = cookies.find(c => c.name === 'XSRF-TOKEN');
        if (!xsrfCookie) {
          throw new Error('Could not find XSRF-TOKEN cookie');
        }
        
        // Laravel XSRF tokens are URL-encoded, so we need to decode them
        // But we need to keep the original encoded version for the header
        const decodedToken = decodeURIComponent(xsrfCookie.value);
        
        await browser.close();
        return { csrfToken: xsrfCookie.value, cookieHeader }; // Use the original encoded token
      } catch (error) {
        await browser.close();
        throw error;
      }
    };

    const getTrackData = async (spotifyUrl, csrfToken, cookieHeader) => {
      const res = await axios.post('https://spotmate.online/getTrackData', {
        url: spotifyUrl
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://spotmate.online',
          'Referer': 'https://spotmate.online/en',
          'Cookie': cookieHeader,
          'x-csrf-token': csrfToken
        }
      });
      return res.data;
    };

    const convertTrack = async (spotifyTrackId, csrfToken, cookieHeader) => {
      const res = await axios.post('https://spotmate.online/convert', {
        id: spotifyTrackId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://spotmate.online',
          'Referer': 'https://spotmate.online/en',
          'Cookie': cookieHeader,
          'x-csrf-token': csrfToken
        }
      });
      return res.data.url;
    };

    try {
      const { csrfToken, cookieHeader } = await getSpotmateCsrfAndCookies();
      const trackData = await getTrackData(url, csrfToken, cookieHeader);
      if (!trackData || !trackData.id) throw new Error('Could not get track metadata.');
      const mp3Url = await convertTrack(trackData.id, csrfToken, cookieHeader);
      if (!mp3Url) throw new Error('Could not get MP3 download link.');

      // Sanitize artist and title for filename
      const sanitize = s => (s || '').replace(/[^a-z0-9_\-\.]/gi, '_');
      const artist = sanitize(trackData.artist || 'artist');
      const title = sanitize(trackData.title || 'track');
      const fileName = `${artist}_${title}.mp3`;
      const filePath = path.join(__dirname, fileName);
      const writer = fs.createWriteStream(filePath);
      const response = await axios.get(mp3Url, { responseType: 'stream' });
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      const embed = new EmbedBuilder()
        .setDescription(`Here's your Spotify MP3 cutie: **${trackData.title || 'Track'}** by **${trackData.artist || 'Artist'}**`)
        .setColor(0x1db954);

      if (fileSizeInMB <= 8) {
        await interaction.editReply({
          content: `${userMention} your media is ready!`,
          embeds: [embed],
          files: [filePath]
        });
      } else {
        if (octokit && GITHUB_TOKEN) {
          const githubUrl = await uploadToGitHubRepo(filePath, 'SMVADB', 'storage');
          embed.setDescription(`Your file is too large for Discord (${fileSizeInMB.toFixed(2)} MB). [Download it here](${githubUrl}) (Link expires in 24 hours)`);
        } else {
          embed.setDescription(`Your file is too large for Discord (${fileSizeInMB.toFixed(2)} MB), and I couldn't upload it to GitHub.`);
        }
        await interaction.editReply({
          content: `${userMention} your media is ready!`,
          embeds: [embed]
        });
      }
      setTimeout(() => {
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
      }, 1000);
    } catch (err) {
      console.error(err);
      const embed = new EmbedBuilder()
        .setDescription('Failed to download or process the Spotify track.')
        .setColor(0xff0000);
      try {
        await interaction.editReply({ content: `${userMention}, something went wrong.`, embeds: [embed] });
      } catch (e) {
        await interaction.followUp({ content: `${userMention}, something went wrong.`, embeds: [embed] });
      }
    }
  }
});

client.login(TOKEN); 