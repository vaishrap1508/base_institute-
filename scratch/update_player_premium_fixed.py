import os

file_path = "/Users/vaishu/Downloads/Base_Project/src/app/student/dashboard/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

def get_motion_div_block(indent_level):
    ind = " " * indent_level
    ind2 = " " * (indent_level + 2)
    ind4 = " " * (indent_level + 4)
    ind6 = " " * (indent_level + 6)
    ind8 = " " * (indent_level + 8)
    ind10 = " " * (indent_level + 10)
    
    code_lines = [
        ind + '<motion.div',
        ind2 + 'ref={mainVideoRef}',
        ind2 + 'layout="position"',
        ind2 + 'className={isMiniPlayerActive',
        ind4 + '? "fixed bottom-6 right-6 w-80 aspect-video shadow-2xl z-50 rounded-2xl border border-blue-500/40 bg-slate-950 overflow-hidden flex flex-col group/pip cursor-pointer"',
        ind4 + ': "w-full aspect-video bg-black rounded-2xl overflow-hidden group relative border border-slate-200 dark:border-slate-900 shadow-md flex flex-col justify-end cursor-pointer"',
        ind2 + '}',
        ind2 + 'onClick={!isVideoPlaying ? (e) => {',
        ind4 + 'const target = e.target as HTMLElement;',
        ind4 + 'if (target.closest(\'button\') || target.closest(\'input\') || target.closest(\'a\')) {',
        ind6 + 'return;',
        ind4 + '}',
        ind4 + 'handlePlayToggle();',
        ind2 + '} : undefined}',
        ind + '>',
        ind2 + '{(() => {',
        ind4 + 'const ytId = getYouTubeId(activeQuestion.videoUrl);',
        ind4 + 'if (ytId) {',
        ind6 + 'if (isVideoPlaying) {',
        ind8 + 'return (',
        ind10 + '<div className="absolute inset-0 w-full h-full bg-black z-0">',
        ind10 + '  <iframe',
        ind10 + '    width="100%"',
        ind10 + '    height="100%"',
        ind10 + '    src={"https://www.youtube.com/embed/" + ytId + "?autoplay=1&rel=0&controls=1"}',
        ind10 + '    title={activeQuestion.videoTitle || "Video solution"}',
        ind10 + '    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"',
        ind10 + '    allowFullScreen',
        ind10 + '    className="w-full h-full border-0"',
        ind10 + '  ></iframe>',
        ind10 + '  <button',
        ind10 + '    type="button"',
        ind10 + '    onClick={(e) => {',
        ind10 + '      e.stopPropagation();',
        ind10 + '      setIsVideoPlaying(false);',
        ind10 + '    }}',
        ind10 + '    className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black/85 text-white hover:text-rose-400 transition-colors shadow-md flex items-center justify-center cursor-pointer"',
        ind10 + '    title="Close Player"',
        ind10 + '  >',
        ind10 + '    <XCircle className="w-4 h-4" />',
        ind10 + '  </button>',
        ind10 + '</div>',
        ind8 + ');',
        ind6 + '} else {',
        ind8 + 'return (',
        ind10 + '<div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden z-0">',
        ind10 + '  <img',
        ind10 + '    src={"https://img.youtube.com/vi/" + ytId + "/maxresdefault.jpg"}',
        ind10 + '    alt="Video Walkthrough Thumbnail"',
        ind10 + '    className="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-102"',
        ind10 + '    onError={(e) => {',
        ind10 + '      (e.target as HTMLImageElement).src = "https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg";',
        ind10 + '    }}',
        ind10 + '  />',
        ind10 + '  <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-colors" />',
        ind10 + '  ',
        ind10 + '  {/* Central Play Button */}',
        ind10 + '  <div className="absolute inset-0 flex items-center justify-center">',
        ind10 + '    <div className="w-12 h-12 rounded-full bg-white/95 group-hover:bg-blue-600 shadow-md group-hover:shadow-blue-500/20 text-slate-900 group-hover:text-white flex items-center justify-center transform group-hover:scale-110 transition-all duration-200 cursor-pointer">',
        ind10 + '      <Play className="w-5 h-5 fill-current ml-0.5" />',
        ind10 + '    </div>',
        ind10 + '  </div>',
        ind10 + '  ',
        ind10 + '  {/* Thumbnail Footer info */}',
        ind10 + '  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white drop-shadow-md">',
        ind10 + '    <div className="flex flex-col text-left">',
        ind10 + '      <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">',
        ind10 + '        Mastery Course',
        ind10 + '      </span>',
        ind10 + '      <span className="text-xs font-extrabold tracking-tight truncate max-w-[200px]">',
        ind10 + '        {activeQuestion.videoTitle || \'Walkthrough Explanation\'}',
        ind10 + '      </span>',
        ind10 + '    </div>',
        ind10 + '    <span className="text-[9px] font-bold bg-black/60 px-1.5 py-0.5 rounded tracking-wide font-mono">',
        ind10 + '      {activeQuestion.videoDuration || \'10 mins\'}',
        ind10 + '    </span>',
        ind10 + '  </div>',
        ind10 + '</div>',
        ind8 + ');',
        ind6 + '}',
        ind4 + '} else {',
        ind6 + 'return (',
        ind8 + '<video',
        ind8 + '  ref={videoRef}',
        ind8 + '  src={activeQuestion.videoUrl}',
        ind8 + '  onTimeUpdate={handleVideoTimeUpdate}',
        ind8 + '  onLoadedMetadata={handleVideoLoadedMetadata}',
        ind8 + '  onEnded={() => {',
        ind8 + '    setIsVideoPlaying(false)',
        ind8 + '    setVideoProgress(100)',
        ind8 + '  }}',
        ind8 + '  className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none"',
        ind8 + '  playsInline',
        ind8 + '/>',
        ind6 + ');',
        ind4 + '}',
        ind2 + '})()}',
        '',
        ind2 + '/* Hover Overlay Controls */',
        ind2 + '{(() => {',
        ind4 + 'const ytId = getYouTubeId(activeQuestion.videoUrl);',
        ind4 + 'if (ytId) {',
        ind6 + 'if (!isVideoPlaying) {',
        ind8 + 'return (',
        ind10 + '<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30 opacity-100 flex flex-col justify-between p-4 z-10 pointer-events-none">',
        ind10 + '  <div className="flex justify-between items-center w-full">',
        ind10 + '    <span className="text-[9.5px] font-black text-white/80 uppercase tracking-wider drop-shadow-sm font-mono truncate max-w-[70%]">',
        ind10 + '      {activeQuestion.videoTitle || \'Walkthrough Explanation\'}',
        ind10 + '    </span>',
        ind10 + '  </div>',
        ind10 + '</div>',
        ind8 + ');',
        ind6 + '}',
        ind6 + 'return null;',
        ind4 + '} else {',
        ind6 + 'return (',
        ind8 + '<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-10">',
        ind8 + '  {/* Player Top Bar */}',
        ind8 + '  <div className="flex justify-between items-center w-full">',
        ind8 + '    <span className="text-[9.5px] font-black text-white/80 uppercase tracking-wider drop-shadow-sm font-mono truncate max-w-[70%]">',
        ind8 + '      {activeQuestion.videoTitle || \'Walkthrough Explanation\'}',
        ind8 + '    </span>',
        ind8 + '  </div>',
        ind8 + '  {/* Player Bottom Bar / Controls */}',
        ind8 + '  <div className="space-y-2.5 w-full">',
        ind8 + '    {/* Progress Slider Track */}',
        ind8 + '    <div className="flex items-center gap-2">',
        ind8 + '      <input',
        ind8 + '        type="range"',
        ind8 + '        min="0"',
        ind8 + '        max="100"',
        ind8 + '        step="0.1"',
        ind8 + '        value={videoProgress}',
        ind8 + '        onChange={handleVideoSliderChange}',
        ind8 + '        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"',
        ind8 + '      />',
        ind8 + '    </div>',
        ind8 + '    <div className="flex items-center justify-between w-full">',
        ind8 + '      <div className="flex items-center gap-3">',
        ind8 + '        <button',
        ind8 + '          onClick={handlePlayToggle}',
        ind8 + '          className="p-1 rounded-md text-white hover:bg-white/10 transition-colors cursor-pointer"',
        ind8 + '        >',
        ind8 + '          {isVideoPlaying ? (',
        ind8 + '            <span className="font-mono text-xs font-black select-none">PAUSE</span>',
        ind8 + '          ) : (',
        ind8 + '            <Play className="w-3.5 h-3.5 fill-current" />',
        ind8 + '          )}',
        ind8 + '        </button>',
        ind8 + '        <span className="font-mono text-[9px] text-white/70 select-none">',
        ind8 + '          {formatTime(videoPlayTime)} / {formatTime(videoDurationSeconds)}',
        ind8 + '        </span>',
        ind8 + '      </div>',
        ind8 + '      <div className="flex items-center gap-2 relative">',
        ind8 + '        {isSpeedMenuOpen && (',
        ind8 + '          <div ',
        ind8 + '            className="absolute bottom-full right-0 mb-2 bg-[#111827]/95 backdrop-blur-md border border-slate-800 rounded-xl p-2 w-32 shadow-xl z-20 flex flex-col gap-0.5 text-left"',
        ind8 + '            onClick={(e) => e.stopPropagation()}',
        ind8 + '          >',
        ind8 + '            <div className="text-[7.5px] font-black uppercase text-slate-400 px-2 py-1 tracking-wider border-b border-slate-700/60 mb-1 select-none">',
        ind8 + '              Playback Speed',
        ind8 + '            </div>',
        ind8 + '            {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((sp) => (',
        ind8 + '              <button',
        ind8 + '                key={sp}',
        ind8 + '                onClick={(e) => {',
        ind8 + '                  e.stopPropagation();',
        ind8 + '                  handlePlaybackSpeedChange(sp);',
        ind8 + '                  setIsSpeedMenuOpen(false);',
        ind8 + '                }}',
        ind8 + '                className={`text-[9px] font-black font-mono w-full text-left px-2 py-1.5 rounded hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer ${',
        ind8 + '                  playbackSpeed === sp ? \'text-blue-400 bg-blue-500/10\' : \'text-white/80\'',
        ind8 + '                }`}',
        ind8 + '              >',
        ind8 + '                <span>{sp === 1 ? \'Normal\' : sp + \'x\'}</span>',
        ind8 + '                {playbackSpeed === sp && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}',
        ind8 + '              </button>',
        ind8 + '            ))}',
        ind8 + '          </div>',
        ind8 + '        )}',
        ind8 + '        <button',
        ind8 + '          onClick={(e) => {',
        ind8 + '            e.stopPropagation();',
        ind8 + '            setIsSpeedMenuOpen(!isSpeedMenuOpen);',
        ind8 + '          }}',
        ind8 + '          className="flex items-center gap-1 text-[8.5px] font-black font-mono px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"',
        ind8 + '        >',
        ind8 + '          <span>Speed: {playbackSpeed === 1 ? \'Normal\' : playbackSpeed + \'x\'}</span>',
        ind8 + '          <SettingsIcon className={`w-3 h-3 transition-transform duration-300 ${isSpeedMenuOpen ? \'rotate-90 text-blue-400\' : \'text-white/80\'}`} />',
        ind8 + '        </button>',
        ind8 + '        {isMiniPlayerActive && (',
        ind8 + '          <button',
        ind8 + '            onClick={(e) => {',
        ind8 + '              e.stopPropagation();',
        ind8 + '              setIsMiniPlayerActive(false);',
        ind8 + '            }}',
        ind8 + '            className="text-[9.5px] font-black text-white hover:text-blue-400 transition-colors bg-white/10 px-1.5 py-0.5 rounded cursor-pointer"',
        ind8 + '          >',
        ind8 + '            EXPAND',
        ind8 + '          </button>',
        ind8 + '        )}',
        ind8 + '      </div>',
        ind8 + '    </div>',
        ind8 + '  </div>',
        ind8 + '</div>',
        ind6 + ');',
        ind4 + '}',
        ind2 + '})()}',
        '',
        ind2 + '/* Non-hover initial play state overlay */',
        ind2 + '{!getYouTubeId(activeQuestion.videoUrl) && !isVideoPlaying && !isMiniPlayerActive && (',
        ind4 + '<div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">',
        ind4 + '  <span className="w-12 h-12 rounded-full bg-blue-600/90 flex items-center justify-center text-white shadow-xl animate-pulse pointer-events-auto cursor-pointer" onClick={(e) => {',
        ind6 + '    e.stopPropagation();',
        ind6 + '    handlePlayToggle();',
        ind4 + '  }}>',
        ind4 + '    <Play className="w-5 h-5 fill-current ml-0.5" />',
        ind4 + '  </span>',
        ind4 + '</div>',
        ind2 + ')}',
        ind + '</motion.div>'
    ]
    return "\n".join(code_lines)

lines = content.splitlines()

new_lines = []
i = 0
player_count = 0

while i < len(lines):
    line = lines[i]
    if "<motion.div" in line and i + 1 < len(lines) and "ref={mainVideoRef}" in lines[i+1]:
        player_count += 1
        print(f"Modifying player {player_count} starting at line {i+1}")
        
        # Determine indentation level
        indent_level = len(line) - len(line.lstrip())
        print(f"Player {player_count} indentation level: {indent_level}")
        
        # Skip until matching </motion.div>
        nested_count = 1
        k = i + 1
        while k < len(lines):
            if "<motion.div" in lines[k]:
                nested_count += 1
            elif "</motion.div>" in lines[k]:
                nested_count -= 1
                if nested_count == 0:
                    break
            k += 1
        
        print(f"Player {player_count} closing tag at line {k+1}")
        
        # Append replacement block
        new_block = get_motion_div_block(indent_level)
        new_lines.append(new_block)
        
        # Advance i to after the closing tag
        i = k + 1
        continue
    
    new_lines.append(line)
    i += 1

new_content = "\n".join(new_lines)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully updated both video players with premium visual designs!")
