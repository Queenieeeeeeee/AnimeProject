import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [selectedDashboard, setSelectedDashboard] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard configuration
  const dashboards = {
    overview: {
      title: '📊 Anime Database Overview',
      intro: 'This dashboard provides a comprehensive snapshot of our anime database, featuring 16,105 titles from 2005-2026. Explore key metrics, production trends, genre distribution, and quality patterns across the industry.',
      insights: [
        {
          title: 'Peak Production Era',
          content: 'Anime production peaked around 2016-2017 with 980+ annual releases, followed by a gradual decline. The 2025-2026 drop reflects incomplete recent data.'
        },
        {
          title: 'Spring Season Dominance',
          content: 'Spring leads with 1,420 releases, likely due to Japan\'s new school year (April) and Golden Week holidays, creating prime audience engagement opportunities.'
        },
        {
          title: 'Comedy Reigns Supreme',
          content: 'Comedy dominates with 5,409 titles (33.6%), followed by Fantasy (3,897) and Action (3,298), showing clear market preference for lighthearted and action-oriented content.'
        },
        {
          title: 'Quality Bell Curve',
          content: 'Most anime score between 6.0-7.5 (average: 6.62), with few titles reaching the elite 9.0+ tier, indicating significant quality variance across the industry.'
        }
      ],
      embedUrl: 'https://public.tableau.com/views/AnimeAnalysis_17660970355310/Overview?:embed=y&:display_count=yes&:showVizHome=no'
    },
    trends: {
      title: '📈 Trends Analysis',
      intro: 'Analyze temporal patterns and genre evolution over two decades. Discover how anime quality has remained consistent, which genres have grown, and which titles have stood the test of time.',
      insights: [
        {
          title: 'Stable Quality Standards',
          content: 'Average scores have remained consistent at 6.5-6.8 across all years, suggesting established industry quality benchmarks with no significant improvement or decline.'
        },
        {
          title: 'Genre Stability',
          content: 'Comedy has maintained dominance throughout all periods, while Action and Fantasy show steady growth. Slice of Life has gained traction in recent years.'
        },
        {
          title: 'Classic vs. Rising Stars',
          content: 'Long-standing favorites like Fullmetal Alchemist: Brotherhood and Gintama maintain exceptional scores despite no recent releases, while newer titles like Sousou no Frieren and Chainsaw Man Movie have emerged as strong contenders, showing the industry\'s continued ability to produce quality content.'
        }
      ],
      embedUrl: 'https://public.tableau.com/views/AnimeAnalysis_17660970355310/TrendsAnalysis?:embed=y&:display_count=yes&:showVizHome=no'
    },
    genreStudio: {
      title: '🎬 Genre & Studio Analysis',
      intro: 'Deep dive into the creators behind the content. Compare studio productivity versus quality, analyze genre performance patterns, and identify which production companies consistently deliver excellence.',
      insights: [
        {
          title: 'Quality Leaders',
          content: 'Kyoto Animation leads in average score (7.51 with 114 titles), while boutique studios like Motion Magic (7.68 with 18 titles) and Shuka (7.64 with 23 titles) excel with smaller but high-quality catalogs, proving that focused production can yield exceptional results.'
        },
        {
          title: 'Volume Production',
          content: 'The top 10 most productive studios account for approximately 15% of all anime production, with Toei Animation (343 titles), Sunrise (308), and J.C.Staff (289) leading in output.'
        },
        {
          title: 'Genre Quality Patterns',
          content: 'Mystery and Drama genres show the highest median scores with less variance, while Comedy has the widest score range (high risk, high reward). Sci-Fi shows many low-scoring outliers.'
        },
        {
          title: 'Production Volatility',
          content: 'Even top studios show fluctuating production volumes year-to-year, indicating a highly competitive industry with no single dominant player.'
        }
      ],
      embedUrl: 'https://public.tableau.com/views/AnimeAnalysis_17660970355310/GenreStudioAnalysis?:embed=y&:display_count=yes&:showVizHome=no'
    },
    userEngagement: {
      title: '👥 User Engagement & Popularity Analysis',
      intro: 'Explore the relationship between popularity and quality. Discover which anime have captured the largest audiences, uncover hidden gems with excellent scores but limited recognition, and understand fan engagement patterns.',
      insights: [
        {
          title: 'Quality Drives Popularity',
          content: 'Strong positive correlation between member count/favorites and score. Higher-rated anime consistently attract larger audiences, with few "overhyped" exceptions.'
        },
        {
          title: 'Mainstream Dominance',
          content: 'Attack on Titan, Fullmetal Alchemist: Brotherhood, Death Note, and One Punch Man lead with 3M+ members each, mostly consisting of accessible shonen titles.'
        },
        {
          title: 'Hidden Gems Revealed',
          content: '20+ titles with scores ≥8.0 but popularity rank >5,000, including Chinese anime like Doupo Cangqiong (8.55) and unique cases like Chiikawa (8.47), which has strong brand recognition but lower anime viewership on tracking platforms.'
        },
        {
          title: 'Favorites = Quality Signal',
          content: 'The Favorites vs Score correlation is even stronger than Members vs Score, suggesting users who "favorite" anime are more selective and quality-focused.'
        }
      ],
      embedUrl: 'https://public.tableau.com/views/AnimeAnalysis_17660970355310/UserEngagementAnalysis?:embed=y&:display_count=yes&:showVizHome=no'
    }
  };

  // Show loading indicator when dashboard changes
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [selectedDashboard]);

  const currentDashboard = dashboards[selectedDashboard];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Anime Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore comprehensive insights from 16,105 anime titles spanning 2005-2026. 
            Dive deep into production trends, genre patterns, studio performance, and audience engagement metrics.
          </p>
        </div>

        {/* Dashboard Selector */}
        <div className="mb-8">
          <label htmlFor="dashboard-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Dashboard
          </label>
          <select
            id="dashboard-select"
            value={selectedDashboard}
            onChange={(e) => setSelectedDashboard(e.target.value)}
            className="block w-full max-w-md mx-auto px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm bg-white"
          >
            <option value="overview">📊 Anime Database Overview</option>
            <option value="trends">📈 Trends Analysis</option>
            <option value="genreStudio">🎬 Genre & Studio Analysis</option>
            <option value="userEngagement">👥 User Engagement & Popularity Analysis</option>
          </select>
        </div>

        {/* Tableau Embed */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            📊 Interactive Dashboard
          </h3>
          
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading dashboard...</span>
            </div>
          )}

          <div className="tableau-container" style={{ width: '100%', height: '900px' }}>
            <iframe
              src={currentDashboard.embedUrl}
              width="100%"
              height="100%"
              allowFullScreen
              title={`Tableau Dashboard: ${currentDashboard.title}`}
            />
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          {/* Dashboard Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {currentDashboard.title}
          </h2>

          {/* Dashboard Introduction */}
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            {currentDashboard.intro}
          </p>

          {/* Key Insights */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              🔍 Key Insights
            </h3>
            <div className="space-y-4">
              {currentDashboard.insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {insight.title}
                  </h4>
                  <p className="text-gray-700">
                    {insight.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Source Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Data Source: <a href="https://myanimelist.net/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">MyAnimeList</a> via <a href="https://jikan.moe/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Jikan API</a>
          </p>
          <p className="mt-2">
            Analysis Period: 2005-2026 | Last Updated: January 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;