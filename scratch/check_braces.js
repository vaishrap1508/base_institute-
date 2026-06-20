const fs = require('fs');

const code = `
          {activeSidebarTab === 'learning' && (
            <div className="w-full space-y-8 relative z-10 text-slate-800 dark:text-slate-200">
              
              {/* Background Ambient Particles & Floating Orbs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
                <motion.div 
                  className="absolute top-1/4 left-1/12 w-64 h-64 rounded-full bg-blue-500/10 blur-[80px]"
                  animate={reducedMotion ? {} : {
                    x: [0, 30, -15, 0],
                    y: [0, -25, 40, 0]
                  }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute bottom-1/4 right-1/12 w-80 h-80 rounded-full bg-purple-500/10 blur-[90px]"
                  animate={reducedMotion ? {} : {
                    x: [0, -40, 25, 0],
                    y: [0, 35, -35, 0]
                  }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
                {/* Subtle Ambient Particles */}
                {!reducedMotion && [...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/15 dark:bg-white/10"
                    style={{
                      left: \`\${15 + i * 15}%\`,
                      top: \`\${20 + (i % 3) * 25}%\`
                    }}
                    animate={{
                      y: [0, -40, 0],
                      opacity: [0.1, 0.4, 0.1],
                      scale: [1, 1.5, 1]
                    }}
                    transition={{
                      duration: 8 + i * 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              {/* Title Header with reveal animation */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: -15, filter: "blur(6px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } }
                }}
                className="text-center space-y-2 relative z-10 select-none"
              >
                <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white font-heading">Your learning roadmap</h1>
                <p className="text-xs text-slate-505 dark:text-slate-400 max-w-md mx-auto font-medium">Click on the active lesson nodes to solve matching assessment questions.</p>
              </motion.div>

              {/* Stats & Progress Dashboard Row */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10 select-none">
                
                {/* Progress Ring Card */}
                <div className="flex items-center gap-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-w-[210px] justify-start text-left">
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-12 h-12 -rotate-90">
                      <circle cx="24" cy="24" r="20" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="4" fill="transparent" />
                      <motion.circle 
                        cx="24" 
                        cy="24" 
                        r="20" 
                        className="stroke-blue-600 dark:stroke-blue-500" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 20}
                        initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - animatedProgress / 100) }}
                        transition={{ duration: reducedMotion ? 0 : 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute text-[11px] font-black text-slate-800 dark:text-white font-mono">{animatedProgress}%</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Roadmap progress</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase mt-1.5 block">Learning Path Status</span>
                  </div>
                </div>

                {/* XP Counter Card */}
                <div className="flex items-center gap-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-w-[210px] justify-start text-left">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-550 dark:text-amber-400 shrink-0">
                    <Flame className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Total experience</span>
                    <span className="text-sm font-black text-slate-800 dark:text-white font-mono mt-1.5 block">
                      {animatedXp.toLocaleString()} XP
                    </span>
                  </div>
                </div>

              </div>

              {/* Category Tab Switcher */}
              <div className="flex flex-wrap justify-center gap-2 mb-6 select-none relative z-10">
                {[
                  { id: 'all', label: 'All Subjects', icon: '🌐' },
                  { id: 'quant', label: 'Quantitative', icon: '📐' },
                  { id: 'logical', label: 'Logical Reasoning', icon: '🧩' },
                  { id: 'verbal', label: 'Verbal Ability', icon: '📚' },
                  { id: 'coding', label: 'Coding & CS', icon: '💻' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRoadmapFilter(tab.id as any)}
                    className={\`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 border \${
                      roadmapFilter === tab.id
                        ? 'bg-[#111827] dark:bg-white text-white dark:text-slate-950 border-transparent shadow-md scale-105'
                        : 'bg-white/60 dark:bg-slate-900/40 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-205 border-slate-250 dark:border-slate-800'
                    }\`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Gamified Winding Bezier Roadmap Path */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={roadmapFilter}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-[520px] select-none my-6"
                  style={{
                    transform: 'perspective(1200px) rotateX(12deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {(() => {
                    const getNodeCoords = (index: number) => {
                      let x = 50;
                      let y = 80;
                      if (index < 3) {
                        x = index === 0 ? 10 : index === 1 ? 50 : 90;
                        y = 80;
                      } else if (index < 6) {
                        x = index === 3 ? 90 : index === 4 ? 50 : 10;
                        y = 260;
                      } else {
                        x = index === 6 ? 10 : index === 7 ? 50 : 90;
                        y = 440;
                      }
                      return { x, y };
                    };

                    const DOMAIN_ROADMAPS = {
                      all: [
                        { id: 1, title: 'Percentages', desc: 'Core fractional relationships', symbol: '%' },
                        { id: 2, title: 'Ratios & Proportions', desc: 'Comparative scale models', symbol: '1:2' },
                        { id: 3, title: 'Profit & Loss', desc: 'Commerce margins & calculations', symbol: '₹' },
                        { id: 4, title: 'Time & Work', desc: 'Rate equations & tasks efficiency', symbol: '⏳' },
                        { id: 5, title: 'Syllogisms', desc: 'Boolean Venn diagrams deductions', symbol: 'V' },
                        { id: 6, title: 'Blood Relations', desc: 'Structured family maps trees', symbol: '👪' },
                        { id: 7, title: 'Coding: Arrays', desc: 'Linear memory indexing logic', symbol: '[]' },
                        { id: 8, title: 'Coding: Recursion', desc: 'Call stacks and induction checks', symbol: '()' },
                        { id: 9, title: 'Mastery Milestone', desc: 'Complete Career Certification', symbol: '🏆' }
                      ],
                      quant: [
                        { id: 1, title: 'Percentages', desc: 'Core fractional relationships', symbol: '%' },
                        { id: 2, title: 'Ratios & Proportions', desc: 'Comparative scale models', symbol: '1:2' },
                        { id: 3, title: 'Profit & Loss', desc: 'Commerce margins & calculations', symbol: '₹' },
                        { id: 4, title: 'Simple Interest', desc: 'Linear accumulation models', symbol: 'P*R' },
                        { id: 5, title: 'Compound Interest', desc: 'Exponential curves and compound periods', symbol: 'A^t' },
                        { id: 6, title: 'Time & Work', desc: 'Rate equations & tasks efficiency', symbol: '⏳' },
                        { id: 7, title: 'Time & Speed', desc: 'Relative velocity equations', symbol: '🚗' },
                        { id: 8, title: 'Geometry & Mensuration', desc: 'Shapes properties and formulas', symbol: '📐' },
                        { id: 9, title: 'Quant Mastery', desc: 'Aptitude Certification Complete', symbol: '🏆' }
                      ],
                      logical: [
                        { id: 1, title: 'Series & Analogy', desc: 'Visual progressions logic patterns', symbol: '1,2' },
                        { id: 2, title: 'Seating Arrangements', desc: 'Linear coordinates spacing constraints', symbol: '🪑' },
                        { id: 3, title: 'Syllogisms', desc: 'Boolean Venn diagrams deductions', symbol: 'V' },
                        { id: 4, title: 'Blood Relations', desc: 'Structured family maps trees', symbol: '👪' },
                        { id: 5, title: 'Clocks & Calendars', desc: 'Periodic time mathematics checks', symbol: '📅' },
                        { id: 6, title: 'Coding-Decoding', desc: 'Cipher shifting mapping tables', symbol: '🔑' },
                        { id: 7, title: 'Data Sufficiency', desc: 'Logical evaluation prerequisites', symbol: '📊' },
                        { id: 8, title: 'Logical Deductions', desc: 'Analytical deduction steps conclusions', symbol: 'Logic' },
                        { id: 9, title: 'Logical Mastery', desc: 'Logical Certification Complete', symbol: '🏆' }
                      ],
                      verbal: [
                        { id: 1, title: 'Spotting Errors', desc: 'Grammar checking logic systems', symbol: '✏️' },
                        { id: 2, title: 'Sentence Improvement', desc: 'Syntax phrasing modifications', symbol: 'ABC' },
                        { id: 3, title: 'Prepositions', desc: 'Spatial connection structure relationships', symbol: 'Prep' },
                        { id: 4, title: 'Reading Comprehension', desc: 'Context interpretation mapping paragraphs', symbol: '📖' },
                        { id: 5, title: 'Synonyms & Antonyms', desc: 'Contextual semantic vocabulary checks', symbol: 'Syn' },
                        { id: 6, title: 'One Word Substitution', desc: 'Noun definitions dictionary compact', symbol: '1W' },
                        { id: 7, title: 'Sentence Arrangement', desc: 'Logical paragraph reordering structures', symbol: 'Sort' },
                        { id: 8, title: 'Idioms & Phrases', desc: 'Metaphoric language vocabulary banks', symbol: 'Phrase' },
                        { id: 9, title: 'Verbal Mastery', desc: 'Verbal Certification Complete', symbol: '🏆' }
                      ],
                      coding: [
                        { id: 1, title: 'Variables & Loops', desc: 'Flow structures state iterations', symbol: 'loop' },
                        { id: 2, title: 'Functions & Scope', desc: 'Modular components calls stack', symbol: 'fn' },
                        { id: 3, title: 'Coding: Arrays', desc: 'Linear memory indexing logic', symbol: '[]' },
                        { id: 4, title: 'Coding: Recursion', desc: 'Call stacks and induction checks', symbol: '()' },
                        { id: 5, title: 'Object Oriented Prog', desc: 'Abstraction encapsulation structures', symbol: 'OOP' },
                        { id: 6, title: 'Searching & Sorting', desc: 'Divide and conquer speed limits', symbol: 'Bin' },
                        { id: 7, title: 'Linked Lists & Queues', desc: 'Dynamic pointer chaining arrays', symbol: '->' },
                        { id: 8, title: 'Trees & Graphs', desc: 'Hierarchical node network traversals', symbol: 'Tree' },
                        { id: 9, title: 'Coding Mastery', desc: 'Technical Certification Complete', symbol: '🏆' }
                      ]
                    };

                    const baseNodes = DOMAIN_ROADMAPS[roadmapFilter] || DOMAIN_ROADMAPS.all;
                    
                    const nodesList = baseNodes.map((node) => {
                      let status = 'locked';
                      if (completedNodeIds.includes(node.id)) {
                        status = 'completed';
                      } else if (node.id === activeNodeId) {
                        status = 'active';
                      }
                      return { ...node, status };
                    });

                    const illustrationsList = [
                      { y: 170, x: 25, icon: null, title: "Apex Peak", desc: "Aptitude standards reached" },
                      { y: 170, x: 75, icon: null, title: "Unlock Spark", desc: "Reveal hidden concepts" },
                      { y: 350, x: 25, icon: null, title: "Logic Gate", desc: "Algorithms unlocked" },
                      { y: 350, x: 75, icon: null, title: "Precision Target", desc: "Aim for mastery goals" }
                    ];

                    const rawSegmentPaths = [
                      "M 10,80 L 50,80",
                      "M 50,80 L 90,80",
                      "M 90,80 C 99,80 99,260 90,260",
                      "M 90,260 L 50,260",
                      "M 50,260 L 10,260",
                      "M 10,260 C 1,260 1,440 10,440",
                      "M 10,440 L 50,440",
                      "M 50,440 L 90,440"
                    ];

                    const segments = rawSegmentPaths.map((pathStr, idx) => {
                      const startNode = nodesList[idx];
                      const endNode = nodesList[idx + 1];
                      
                      let status = "locked";
                      if (startNode.status === 'completed') {
                        if (endNode && endNode.status === 'completed') {
                          status = 'completed';
                        } else if (endNode && endNode.status === 'active') {
                          status = 'active-transition';
                        } else {
                          status = 'completed';
                        }
                      }
                      return { d: pathStr, status };
                    });

                    const activeIndex = nodesList.findIndex(n => n.status === 'active');
                    const completedCoords = [];
                    for (let i = 0; i <= (activeIndex !== -1 ? activeIndex : 0); i++) {
                      const { x, y } = getNodeCoords(i);
                      completedCoords.push(\`\${x},\${y}\`);
                    }
                    const motionPath = completedCoords.length > 1
                      ? \`M \${completedCoords.join(' L ')}\`
                      : \`M 10,80 L 10,80\`;

                    const handleLockedClick = (nodeId) => {
                      setShakeNodeId(nodeId);
                      setTimeout(() => setShakeNodeId(null), 550);
                    };

                    return (
                      <>
                        {/* SVG Curve Canvas */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 520" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="completed-grad" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#10B981" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                            <linearGradient id="active-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" />
                              <stop offset="100%" stopColor="#2563EB" />
                            </linearGradient>
                            <filter id="active-glow" x="-30%" y="-30%" width="160%" height="160%">
                              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#3B82F6" floodOpacity="0.5" />
                            </filter>
                            <filter id="completed-glow" x="-30%" y="-30%" width="160%" height="160%">
                              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10B981" floodOpacity="0.35" />
                            </filter>
                          </defs>

                          {/* Decorative stars */}
                          <g opacity="0.25" className="text-emerald-500 dark:text-emerald-400">
                            <path d="M 78,130 L 81,133 L 86,133 L 82,136 L 83,141 L 78,138 L 73,141 L 74,136 L 70,133 Z" fill="currentColor" />
                            <path d="M 25,360 L 28,363 L 33,363 L 29,366 L 30,371 L 25,368 L 20,371 L 21,366 L 17,363 Z" fill="currentColor" />
                          </g>

                          {/* 3D Road Side Extrusion (Thick Depth Edge) */}
                          {segments.map((seg, i) => (
                            <path
                              key={\`extrusion-\${i}\`}
                              d={seg.d}
                              fill="none"
                              className="stroke-slate-300/40 dark:stroke-[#020617]"
                              strokeWidth="16"
                              strokeLinecap="round"
                              transform="translate(0, 5)"
                            />
                          ))}

                          {/* Colored Road Side Extrusion for Completed & Active tracks */}
                          {segments.map((seg, i) => {
                            if (seg.status === 'completed') {
                              return (
                                <path
                                  key={\`ext-completed-\${i}\`}
                                  d={seg.d}
                                  fill="none"
                                  stroke="#047857"
                                  strokeWidth="12"
                                  strokeLinecap="round"
                                  transform="translate(0, 4)"
                                />
                              );
                            } else if (seg.status === 'active-transition') {
                              return (
                                <path
                                  key={\`ext-active-\${i}\`}
                                  d={seg.d}
                                  fill="none"
                                  stroke="#1D4ED8"
                                  strokeWidth="12"
                                  strokeLinecap="round"
                                  transform="translate(0, 4)"
                                />
                              );
                            }
                            return null;
                          })}

                          {/* Background Road Borders & Fill */}
                          {segments.map((seg, i) => (
                            <React.Fragment key={\`bg-road-\${i}\`}>
                              <path
                                d={seg.d}
                                fill="none"
                                className="stroke-slate-200/50 dark:stroke-slate-900"
                                strokeWidth="14"
                                strokeLinecap="round"
                              />
                              <path
                                d={seg.d}
                                fill="none"
                                className="stroke-slate-100 dark:stroke-[#030712]/90"
                                strokeWidth="10"
                                strokeLinecap="round"
                              />
                            </React.Fragment>
                          ))}

                          {/* Active / Completed Winding Road Colors */}
                          {segments.map((seg, i) => {
                            if (seg.status === 'completed') {
                              return (
                                <React.Fragment key={\`fg-road-\${i}\`}>
                                  {/* Green colored road segment with dynamic draw path */}
                                  <motion.path
                                    d={seg.d}
                                    fill="none"
                                    stroke="url(#completed-grad)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    filter="url(#completed-glow)"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: reducedMotion ? 0 : 1.5, ease: "easeInOut" }}
                                  />
                                  {/* White dashed highway lane divider lines */}
                                  <path
                                    d={seg.d}
                                    fill="none"
                                    stroke="#FFFFFF"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeDasharray="4 4"
                                    opacity="0.6"
                                  />
                                  {/* Shimmer light streak moves along completed segments */}
                                  <motion.path
                                    d={seg.d}
                                    fill="none"
                                    stroke="#FFFFFF"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    opacity="0.8"
                                    strokeDasharray="15 150"
                                    animate={{ strokeDashoffset: [0, -330] }}
                                    transition={{
                                      duration: reducedMotion ? 0 : 5,
                                      repeat: Infinity,
                                      ease: "linear"
                                    }}
                                  />
                                </React.Fragment>
                              );
                            } else if (seg.status === 'active-transition') {
                              return (
                                <React.Fragment key={\`fg-road-\${i}\`}>
                                  {/* Green to Blue gradient transition road segment */}
                                  <motion.path
                                    d={seg.d}
                                    fill="none"
                                    stroke="url(#active-grad)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    filter="url(#active-glow)"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: reducedMotion ? 0 : 1.5, ease: "easeInOut" }}
                                  />
                                  {/* Active flowing highway lane dashes */}
                                  <motion.path
                                    d={seg.d}
                                    fill="none"
                                    stroke="#FFFFFF"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeDasharray="6 4"
                                    opacity="0.8"
                                    animate={{ strokeDashoffset: [0, -20] }}
                                    transition={{
                                      duration: reducedMotion ? 0 : 1.2,
                                      repeat: Infinity,
                                      ease: "linear"
                                    }}
                                  />
                                </React.Fragment>
                              );
                            } else {
                              return (
                                <motion.path
                                  key={\`fg-road-\${i}\`}
                                  d={seg.d}
                                  fill="none"
                                  className="stroke-slate-200 dark:stroke-slate-800"
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  strokeDasharray="8 6"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: reducedMotion ? 0 : 1.5, ease: "easeInOut" }}
                                />
                              );
                            }
                          })}

                          {/* Animated Traveling Glow Orb along the completed path */}
                          <circle r="6" fill="#60A5FA" className="filter drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">
                            <animateMotion 
                              dur="5s" 
                              repeatCount="indefinite" 
                              path={motionPath} 
                            />
                          </circle>
                        </svg>

                        {/* Side decorative Illustration cards with scroll viewport enter stagger */}
                        {illustrationsList.map((ill, i) => (
                          <motion.div 
                            key={i}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-20px" }}
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              visible: (custom) => ({
                                opacity: 1,
                                y: 0,
                                transition: { delay: custom * 0.15 + 0.3, duration: 0.6, ease: "easeOut" }
                              })
                            }}
                            className="absolute flex items-center gap-2.5 bg-white/80 dark:bg-slate-950/75 border border-slate-250 dark:border-slate-900/80 p-2.5 rounded-2xl shadow-md w-36 select-none hover:scale-105 pointer-events-none transition-transform"
                            style={{ 
                              left: \`\${ill.x}%\`, 
                              top: \`\${ill.y}px\`,
                              transform: 'translate3d(-50%, -50%, 15px)',
                              boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.3)'
                            }}
                          >
                            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 shadow-inner">
                              {ill.icon}
                            </div>
                            <div className="min-w-0 text-left">
                              <span className="text-[9px] font-black text-slate-800 dark:text-white block uppercase tracking-wide leading-none">{ill.title}</span>
                              <span className="text-[7.5px] text-slate-450 dark:text-slate-505 font-semibold block leading-tight mt-0.5 truncate">{ill.desc}</span>
                            </div>
                          </motion.div>
                        ))}

                        {/* HTML Nodes overlay */}
                        {nodesList.map((node, index) => {
                          const { x, y } = getNodeCoords(index);
                          const isCompleted = node.status === 'completed';
                          const isActive = node.status === 'active';
                          const isLocked = node.status === 'locked';
                          const isJustUnlocked = justUnlockedNodeId === node.id;

                          const zElevation = isActive ? 35 : isCompleted ? 20 : 5;
                          const alternateOffset = index % 2 === 0 ? -15 : 15;

                          return (
                            <motion.div 
                              key={node.id} 
                              initial={{ opacity: 0, x: alternateOffset }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true, margin: "-40px" }}
                              transition={{ duration: reducedMotion ? 0 : 0.5, delay: index * 0.05 }}
                              className="absolute flex flex-col items-center z-10"
                              style={{ 
                                left: \`\${x}%\`, 
                                top: \`\${y}px\`,
                                transform: \`translate3d(-50%, -50%, \${zElevation}px)\`,
                                transformStyle: 'preserve-3d',
                              }}
                            >
                              
                              {/* Pulsing glow under active node */}
                              {isActive && (
                                <motion.div
                                  className="absolute inset-0 w-14 h-14 rounded-full bg-blue-500/40 blur-md pointer-events-none"
                                  animate={reducedMotion ? {} : {
                                    scale: [1, 1.35, 1],
                                    opacity: [0.6, 0.15, 0.6]
                                  }}
                                  transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                />
                              )}

                              {/* Floating rocket indicator above active node */}
                              {isActive && (
                                <motion.div 
                                  className="absolute -top-14 z-20 flex flex-col items-center select-none"
                                  animate={reducedMotion ? {} : { y: [-4, 4, -4] }}
                                  transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                  style={{
                                    transform: 'translate3d(0, 0, 10px)',
                                  }}
                                >
                                  <div className="bg-slate-900/90 dark:bg-white text-white dark:text-slate-950 p-1.5 rounded-full shadow-lg border border-slate-700/20">
                                    <Rocket className="w-3.5 h-3.5 rotate-45 text-blue-550 dark:text-blue-600 animate-pulse" />
                                  </div>
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 animate-ping" />
                                </motion.div>
                              )}

                              {/* Circular 3D Lesson Node */}
                              <motion.button
                                onClick={() => {
                                  if (!isLocked) {
                                    if (isActive) {
                                      setActiveChallengeNode(node);
                                    } else {
                                      setActiveSidebarTab('practice');
                                      setSelectedDomain('quant');
                                    }
                                  } else {
                                    handleLockedClick(node.id);
                                  }
                                }}
                                whileHover={isLocked ? {} : {
                                  y: -6,
                                  scale: 1.02,
                                  boxShadow: "0 12px 24px rgba(59, 130, 246, 0.45)"
                                }}
                                animate={
                                  shakeNodeId === node.id 
                                    ? { x: [0, -6, 6, -6, 6, 0] } 
                                    : isJustUnlocked
                                    ? { scale: [0.8, 1.15, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }
                                    : {}
                                }
                                transition={{ duration: 0.4 }}
                                disabled={isLocked && shakeNodeId !== node.id}
                                className={\`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 select-none cursor-pointer relative \${
                                  isCompleted 
                                    ? 'bg-gradient-to-tr from-emerald-555 to-teal-400 border-b-4 border-emerald-700 text-white shadow-[0_4px_0_#047857,0_6px_12px_rgba(16,185,129,0.15)] active:translate-y-0.5 active:border-b-2' 
                                    : isActive 
                                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-550 border-b-[6px] border-blue-800 text-white shadow-[0_6px_0_#1E40AF,0_8px_16px_rgba(59,130,246,0.25)] active:translate-y-1 active:border-b-4 hover:brightness-110' 
                                    : 'bg-slate-100 border-b-2 border-slate-350 dark:bg-slate-900 dark:border-slate-950 text-slate-400 dark:text-slate-655 cursor-not-allowed'
                                }\`}
                              >
                                {/* Active sweep shine on Trophy icon */}
                                {node.symbol === '🏆' && !isLocked && (
                                  <motion.div
                                    className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
                                    animate={reducedMotion ? {} : {
                                      left: ["-100%", "200%"],
                                    }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Infinity,
                                      repeatDelay: 8,
                                      ease: "easeInOut"
                                    }}
                                  />
                                )}

                                {/* Lock icon fade transition */}
                                <AnimatePresence>
                                  {isLocked && (
                                    <motion.div
                                      initial={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <Lock className="w-4.5 h-4.5" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Unlocked icons */}
                                {!isLocked && (
                                  <>
                                    {isCompleted ? (
                                      <Check className="w-7 h-7 stroke-[3.5]" />
                                    ) : node.symbol === '🏆' ? (
                                      <Trophy className="w-5.5 h-5.5 text-amber-505" />
                                    ) : (
                                      <span className="text-base font-black font-mono">{node.symbol}</span>
                                    )}
                                  </>
                                )}
                              </motion.button>

                              {/* Node Label card popup */}
                              <div 
                                className="absolute top-16 text-center bg-white/95 dark:bg-slate-900/90 p-2 rounded-xl border border-slate-250 dark:border-slate-800 shadow-md w-34 backdrop-blur-md"
                                style={{
                                  transform: 'translate3d(0, 0, 15px)',
                                  boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.25)'
                                }}
                              >
                                <span className="text-[9px] font-black text-slate-800 dark:text-white block truncate uppercase">{node.title}</span>
                                <span className="text-[7.5px] text-slate-505 dark:text-slate-400 font-semibold block leading-tight mt-0.5">{node.desc}</span>
                                {isActive && (
                                  <span className="text-[7.5px] text-blue-600 dark:text-blue-400 font-black block mt-0.5">75% Complete</span>
                                )}
                                {isLocked && shakeNodeId === node.id && (
                                  <motion.span 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[7px] text-rose-600 dark:text-rose-400 font-black block mt-0.5 uppercase tracking-wide"
                                  >
                                    Previous lesson locked
                                  </motion.span>
                                )}
                              </div>

                            </motion.div>
                          );
                        })}
                      </>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>

              {/* Confetti Burst Overlay */}
              {showConfettiBurst && (
                <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                  {[...Array(35)].map((_, i) => {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 60 + Math.random() * 180;
                    const destX = Math.cos(angle) * distance;
                    const destY = Math.sin(angle) * distance - 80;
                    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
                    const color = colors[i % colors.length];
                    return (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-sm"
                        style={{
                          left: "50%",
                          top: "55%",
                          backgroundColor: color,
                        }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                        animate={{
                          x: destX,
                          y: destY,
                          opacity: 0,
                          scale: 0.4,
                          rotate: Math.random() * 360
                        }}
                        transition={{ duration: 1.3, ease: "easeOut" }}
                      />
                    );
                  })}
                </div>
              )}

              {/* XP Burst Float Up Animation Overlay */}
              {showXpBurst && (
                <motion.div
                  className="absolute z-50 text-emerald-555 dark:text-emerald-400 font-extrabold text-xs font-mono drop-shadow-[0_2px_4px_rgba(16,185,129,0.3)] flex items-center gap-1 select-none pointer-events-none bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900"
                  style={{
                    left: \`\${showXpBurst.x}%\`,
                    top: \`\${showXpBurst.y}px\`,
                    transform: 'translate(-50%, -100%)'
                  }}
                  initial={{ y: 0, opacity: 1, scale: 0.8 }}
                  animate={{ y: -70, opacity: 0, scale: 1.25 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  onAnimationComplete={() => setShowXpBurst(null)}
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>+{showXpBurst.amount} XP</span>
                </motion.div>
              )}

              {/* Interactive Mini-Lesson Challenge Modal */}
              <AnimatePresence>
                {activeChallengeNode && (() => {
                  const ROADMAP_CHALLENGES = {
                    'Percentages': {
                      question: "A laptop price drops from ₹40,000 to ₹34,000. What is the percentage decrease in the price?",
                      options: ["10%", "12%", "15%", "18%"],
                      correctIndex: 2,
                      solution: "Decrease = 40,000 - 34,000 = 6,000. Percentage = (6,000 / 40,000) * 100 = 15%."
                    },
                    'Ratios & Proportions': {
                      question: "If 3A = 4B = 5C, what is the ratio A : B : C?",
                      options: ["3 : 4 : 5", "20 : 15 : 12", "5 : 4 : 3", "12 : 15 : 20"],
                      correctIndex: 1,
                      solution: "Divide by LCM of 3, 4, 5 (which is 60). A/20 = B/15 = C/12. So ratio is 20 : 15 : 12."
                    },
                    'Profit & Loss': {
                      question: "By selling an item for ₹600, a merchant makes a profit of 20%. What is the Cost Price (CP) of the item?",
                      options: ["₹480", "₹500", "₹520", "₹540"],
                      correctIndex: 1,
                      solution: "SP = CP * 1.20 => 600 = CP * 1.20 => CP = 600 / 1.20 = ₹500."
                    },
                    'Time & Work': {
                      question: "A can complete a project in 12 days and B can do it in 24 days. How many days will they take working together?",
                      options: ["6 days", "8 days", "9 days", "10 days"],
                      correctIndex: 1,
                      solution: "Together rate = 1/12 + 1/24 = 3/24 = 1/8. So working together they will take 8 days."
                    },
                    'Syllogisms': {
                      question: "Statements: All stars are planets. Some planets are moons. Conclusion: Are some stars moons?",
                      options: ["Yes, definitely", "No, definitely", "Maybe, not certain", "None of the above"],
                      correctIndex: 2,
                      solution: "There is no connection given between stars and moons, so it is possible but not logically certain."
                    },
                    'Blood Relations': {
                      question: "Anil introduces a man as 'He is the son of the only son of my father'. How is Anil related to the man?",
                      options: ["Brother", "Uncle", "Father", "Cousin"],
                      correctIndex: 2,
                      solution: "The 'only son of Anil's father' is Anil himself. So the man is Anil's son, making Anil his Father."
                    },
                    'Coding: Arrays': {
                      question: "What is the worst-case time complexity of inserting an element into a dynamic array (vector) of size N?",
                      options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
                      correctIndex: 2,
                      solution: "In the worst case, the array is full, requiring copying all N elements to a new location, taking O(N)."
                    },
                    'Coding: Recursion': {
                      question: "What is the time complexity of the standard recursive Fibonacci function (F(n) = F(n-1) + F(n-2))?",
                      options: ["O(log N)", "O(N)", "O(N^2)", "O(2^N)"],
                      correctIndex: 3,
                      solution: "The recursion tree splits into 2 branches at each level, resulting in an exponential O(2^N) time complexity."
                    },
                    'Mastery Milestone': {
                      question: "Which sorting algorithm has O(N log N) worst-case time complexity and O(N) space complexity?",
                      options: ["Merge Sort", "Quick Sort", "Heap Sort", "Bubble Sort"],
                      correctIndex: 0,
                      solution: "Merge Sort has a guaranteed O(N log N) time complexity in all cases but requires O(N) auxiliary space."
                    }
                  };

                  const challenge = ROADMAP_CHALLENGES[activeChallengeNode.title] || ROADMAP_CHALLENGES['Profit & Loss'];
                  const isSubmitted = challengeSubmitted[activeChallengeNode.id];
                  const selectedAnswer = challengeAnswers[activeChallengeNode.id];

                  const getNodeCoordsByIndex = (idx) => {
                    if (idx < 3) return { x: idx === 0 ? 10 : idx === 1 ? 50 : 90, y: 80 };
                    if (idx < 6) return { x: idx === 3 ? 90 : idx === 4 ? 50 : 10, y: 260 };
                    return { x: idx === 6 ? 10 : idx === 7 ? 50 : 90, y: 440 };
                  };

                  return (
                    <div className="fixed inset-0 bg-slate-955/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left"
                      >
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              <BookOpenCheck className="w-4 h-4 text-blue-600" />
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Lesson Challenge</span>
                          </div>
                          <button
                            onClick={() => setActiveChallengeNode(null)}
                            className="text-slate-405 hover:text-slate-650 dark:hover:text-slate-200 transition-colors p-1"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>

                        <div className="my-5 space-y-4">
                          <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wide">
                            {activeChallengeNode.title}
                          </h3>
                          <p className="text-sm text-slate-705 dark:text-slate-350 font-semibold leading-relaxed">
                            {challenge.question}
                          </p>
                          
                          <div className="space-y-2.5 pt-2">
                            {challenge.options.map((opt, oIdx) => {
                              const optionId = String.fromCharCode(65 + oIdx); 
                              const isSelected = selectedAnswer === optionId;
                              const isCorrectOption = oIdx === challenge.correctIndex;
                              
                              return (
                                <button
                                  key={oIdx}
                                  disabled={isSubmitted}
                                  onClick={() => setChallengeAnswers(prev => ({ ...prev, [activeChallengeNode.id]: optionId }))}
                                  className={\`w-full p-3.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all \${
                                    isSubmitted && isCorrectOption
                                      ? 'bg-emerald-55 border-emerald-500 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500 dark:text-emerald-305'
                                      : isSubmitted && isSelected && !isCorrectOption
                                      ? 'bg-rose-50 border-rose-500 text-rose-800 dark:bg-rose-950/20 dark:border-rose-500 dark:text-rose-300'
                                      : isSelected
                                      ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/30 dark:border-blue-500 text-slate-900 dark:text-white'
                                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }\`}
                                >
                                  <span>{optionId}. {opt}</span>
                                  {isSubmitted && isCorrectOption && (
                                    <span className="w-4.5 h-4.5 rounded-full bg-emerald-550 flex items-center justify-center text-white text-[9px] font-black">✓</span>
                                  )}
                                  {isSubmitted && isSelected && !isCorrectOption && (
                                    <span className="w-4.5 h-4.5 rounded-full bg-rose-550 flex items-center justify-center text-white text-[9px] font-black">✗</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive Explanation drawer */}
                        {isSubmitted && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-605 dark:text-slate-400 font-semibold my-4 leading-normal"
                          >
                            <span className="text-[9px] font-black text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-1 mb-2 uppercase">Explanation</span>
                            {challenge.solution}
                          </motion.div>
                        )}

                        <div className="pt-4 border-t border-slate-105 dark:border-slate-800 flex justify-end gap-2">
                          {!isSubmitted ? (
                            <button
                              disabled={!selectedAnswer}
                              onClick={() => {
                                setChallengeSubmitted(prev => ({ ...prev, [activeChallengeNode.id]: true }));
                                const targetOptIdx = selectedAnswer.charCodeAt(0) - 65;
                                if (targetOptIdx === challenge.correctIndex) {
                                  
                                  // Confetti burst
                                  setShowConfettiBurst(true);
                                  setTimeout(() => setShowConfettiBurst(false), 2000);

                                  // XP burst at node coordinates
                                  const nodeIndex = baseNodes.findIndex(n => n.id === activeChallengeNode.id);
                                  const nodeCoords = getNodeCoordsByIndex(nodeIndex);
                                  setShowXpBurst({ x: nodeCoords.x, y: nodeCoords.y, amount: 150 });

                                  // Increment XP
                                  setAnimatedXp(prev => prev + 150);

                                  // Unlock Animation
                                  setTimeout(() => {
                                    setCompletedNodeIds(prev => [...prev, activeChallengeNode.id]);
                                    
                                    const nextNode = baseNodes[nodeIndex + 1];
                                    if (nextNode) {
                                      setActiveNodeId(nextNode.id);
                                      setJustUnlockedNodeId(nextNode.id);
                                      setTimeout(() => setJustUnlockedNodeId(null), 3000);
                                    }
                                    
                                    setSolvedCount(prev => prev + 1);
                                    setStreak(prev => prev + 1);
                                    setActiveChallengeNode(null);
                                  }, 1500);

                                }
                              }}
                              className={\`py-2 px-5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-95 transition-all \${
                                selectedAnswer 
                                  ? 'bg-blue-650 hover:bg-blue-600' 
                                  : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none'
                              }\`}
                            >
                              Submit Answer
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveChallengeNode(null)}
                              className="py-2 px-5 bg-blue-650 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                            >
                              Got It
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}
              </AnimatePresence>

            </div>
          )}
`;

function checkBraces(code) {
  let curly = 0;
  let paren = 0;
  let square = 0;
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === '{') curly++;
    else if (char === '}') curly--;
    else if (char === '(') paren++;
    else if (char === ')') paren--;
    else if (char === '[') square++;
    else if (char === ']') square--;
    
    if (curly < 0) {
      console.log('Unbalanced curly at index', i);
      return false;
    }
    if (paren < 0) {
      console.log('Unbalanced paren at index', i);
      return false;
    }
    if (square < 0) {
      console.log('Unbalanced square at index', i);
      return false;
    }
  }
  
  console.log('Final counts:', { curly, paren, square });
  return curly === 0 && paren === 0 && square === 0;
}

const result = checkBraces(code);
console.log('Brace balanced:', result);
if (!result) {
  process.exit(1);
}
