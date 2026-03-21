import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Fix text colors
  content = content.replace(/text-white dark:text-white text-black/g, 'text-black dark:text-white');
  
  // Fix background colors
  content = content.replace(/bg-\[#13141C\] dark:bg-\[#13141C\] bg-\[#F4F7FB\]/g, 'bg-[#F4F7FB] dark:bg-[#13141C]');
  content = content.replace(/bg-white\/5 dark:bg-white\/5 bg-black\/5/g, 'bg-black/5 dark:bg-white/5');
  content = content.replace(/bg-\[#353945\] dark:bg-\[#353945\] bg-\[#F1F5F9\]/g, 'bg-[#F1F5F9] dark:bg-[#353945]');
  content = content.replace(/bg-\[#252836\] dark:bg-\[#252836\] bg-\[#F1F5F9\]/g, 'bg-[#F1F5F9] dark:bg-[#252836]');
  content = content.replace(/bg-\[#252836\] dark:bg-\[#252836\] bg-white/g, 'bg-white dark:bg-[#252836]');
  content = content.replace(/bg-\[#1A1C23\] dark:bg-\[#1A1C23\] bg-white/g, 'bg-white dark:bg-[#1A1C23]');
  content = content.replace(/bg-\[#1A1C23\]\/50 dark:bg-\[#1A1C23\]\/50 bg-\[#F8FAFC\]\/50/g, 'bg-[#F8FAFC]/50 dark:bg-[#1A1C23]/50');
  content = content.replace(/bg-\[#13141C\] dark:bg-\[#13141C\] bg-\[#F8FAFC\]/g, 'bg-[#F8FAFC] dark:bg-[#13141C]');
  
  // Fix border colors
  content = content.replace(/border-white\/10 dark:border-white\/10 border-black\/10/g, 'border-black/10 dark:border-white/10');
  content = content.replace(/border-transparent dark:border-transparent border-black\/5/g, 'border-black/5 dark:border-transparent');
  content = content.replace(/border-white\/5 dark:border-white\/5 border-black\/5/g, 'border-black/5 dark:border-white/5');
  
  // Fix hover backgrounds
  content = content.replace(/hover:bg-white\/5 dark:hover:bg-white\/5 hover:bg-black\/5/g, 'hover:bg-black/5 dark:hover:bg-white/5');
  content = content.replace(/hover:bg-white\/10 dark:hover:bg-white\/10 hover:bg-black\/10/g, 'hover:bg-black/10 dark:hover:bg-white/10');
  content = content.replace(/hover:bg-\[#252836\] dark:hover:bg-\[#252836\] hover:bg-\[#F1F5F9\]/g, 'hover:bg-[#F1F5F9] dark:hover:bg-[#252836]');
  content = content.replace(/hover:bg-\[#353945\] dark:hover:bg-\[#353945\] hover:bg-black\/5/g, 'hover:bg-black/5 dark:hover:bg-[#353945]');
  content = content.replace(/hover:bg-\[#1A1C23\] dark:hover:bg-\[#1A1C23\] hover:bg-white/g, 'hover:bg-white dark:hover:bg-[#1A1C23]');
  
  // Fix hover text
  content = content.replace(/hover:text-white dark:hover:text-white hover:text-black/g, 'hover:text-black dark:hover:text-white');
  
  // Fix group hover
  content = content.replace(/group-hover:bg-white dark:group-hover:bg-white group-hover:bg-\[#3B82F6\]/g, 'group-hover:bg-[#3B82F6] dark:group-hover:bg-white');
  content = content.replace(/group-hover:text-black dark:group-hover:text-black group-hover:text-white/g, 'group-hover:text-white dark:group-hover:text-black');

  // Fix focus
  content = content.replace(/focus:border-white\/10 dark:focus:border-white\/10 focus:border-black\/10/g, 'focus:border-black/10 dark:focus:border-white/10');
  content = content.replace(/focus:bg-\[#1A1C23\] dark:focus:bg-\[#1A1C23\] focus:bg-white/g, 'focus:bg-white dark:focus:bg-[#1A1C23]');
  
  // Fix placeholder
  content = content.replace(/placeholder:text-\[#808191\] dark:placeholder:text-\[#808191\] placeholder:font-normal/g, 'placeholder:font-normal placeholder:text-[#808191] dark:placeholder:text-[#808191]');
  
  // Fix other text
  content = content.replace(/text-\[#13141C\] bg-white px-3 py-1 rounded-full font-black flex items-center gap-1.5 dark:text-\[#13141C\] dark:bg-white text-black bg-white/g, 'text-black bg-white px-3 py-1 rounded-full font-black flex items-center gap-1.5 dark:text-[#13141C] dark:bg-white');

  // Fix hover border
  content = content.replace(/hover:border-white\/20 dark:hover:border-white\/20 hover:border-black\/20/g, 'hover:border-black/20 dark:hover:border-white/20');

  content = content.replace(/bg-\[#252836\]\/60 dark:bg-\[#252836\]\/60 bg-black\/5/g, 'bg-black/5 dark:bg-[#252836]/60');
  content = content.replace(/focus-within:bg-\[#252836\] dark:focus-within:bg-\[#252836\] focus-within:bg-white/g, 'focus-within:bg-white dark:focus-within:bg-[#252836]');
  content = content.replace(/focus-within:border-white\/10 dark:focus-within:border-white\/10 focus-within:border-black\/10/g, 'focus-within:border-black/10 dark:focus-within:border-white/10');
  
  // Header bg
  content = content.replace(/bg-\[#13141C\]\/95 dark:bg-\[#13141C\]\/95 bg-white\/95/g, 'bg-white/95 dark:bg-[#13141C]/95');
  content = content.replace(/bg-\[#13141C\] dark:bg-\[#13141C\] bg-\[#F4F7FB\]/g, 'bg-[#F4F7FB] dark:bg-[#13141C]');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walkDir(filePath);
      }
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      replaceInFile(filePath);
    }
  }
}

walkDir('./components');
walkDir('./app');
