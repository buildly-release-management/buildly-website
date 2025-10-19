/**
 * Buildly Social Media Content Configuration
 * This file contains platform-specific content configurations and playlist mappings
 * Update this file when new playlists or social media accounts are created
 */

// YouTube Channel Configuration
const YOUTUBE_CONFIG = {
    channelId: '@buildlyio',
    channelUrl: 'https://www.youtube.com/@buildlyio',
    
    // Current playlists - update this when new playlists are created
    playlists: [
        {
            id: 'PL1jv2HYPjoUNOD3Bbuxe7WirIVEBmnHY_',
            title: 'Product Management Tips',
            description: 'Strategic insights, planning frameworks, and actionable tips for product managers',
            emoji: '📊',
            color: 'from-buildly-accent to-yellow-500',
            buttonColor: 'bg-buildly-accent hover:bg-yellow-600',
            tags: ['Product Management', 'Strategy', 'Planning'],
            lastUpdated: null
        },
        {
            id: 'PL1jv2HYPjoUMcILCfjtiWsRCZiIUKQjBM',
            title: 'Presentations',
            description: 'Conference talks, keynotes, and thought leadership presentations',
            emoji: '🎤',
            color: 'from-indigo-500 to-blue-600',
            buttonColor: 'bg-indigo-500 hover:bg-indigo-600',
            tags: ['Conferences', 'Speaking', 'Thought Leadership'],
            lastUpdated: '2025-01-03', // Recently updated
            isRecentlyUpdated: true
        },
        {
            id: 'PL1jv2HYPjoUPSkv3Mi_TFG4XnLxuksorW',
            title: 'Tutorials',
            description: 'Step-by-step guides, how-to videos, and technical walkthrough content',
            emoji: '🎓',
            color: 'from-buildly-primary to-blue-600',
            buttonColor: 'bg-buildly-primary hover:bg-buildly-secondary',
            tags: ['Education', 'How-to', 'Technical'],
            lastUpdated: null
        },
        {
            id: 'PL1jv2HYPjoUOd6dWU6d7ktIEjCRBximDQ',
            title: 'Demos',
            description: 'Live demonstrations of Buildly platform features and capabilities',
            emoji: '🚀',
            color: 'from-green-500 to-teal-600',
            buttonColor: 'bg-green-500 hover:bg-green-600',
            tags: ['Platform Demo', 'Features', 'Live Demo'],
            lastUpdated: null
        },
        {
            id: 'PL1jv2HYPjoUOaH2PXgwIYAx2mv08F94Gv',
            title: 'About Buildly',
            description: 'Company overview, mission, team introductions, and behind-the-scenes content',
            emoji: '🏢',
            color: 'from-buildly-secondary to-purple-600',
            buttonColor: 'bg-buildly-secondary hover:bg-purple-600',
            tags: ['Company', 'Team', 'Culture'],
            lastUpdated: null
        }
    ]
};

// Instagram Configuration
const INSTAGRAM_CONFIG = {
    username: '@buildlyio',
    url: 'https://www.instagram.com/buildlyio/',
    contentTypes: [
        {
            type: 'posts',
            description: 'Behind-the-scenes, team highlights, and product updates'
        },
        {
            type: 'stories',
            description: 'Daily insights, quick tips, and live updates'
        },
        {
            type: 'reels',
            description: 'Short-form educational content and product demos'
        }
    ]
};

// TikTok Configuration
const TIKTOK_CONFIG = {
    username: '@buildlyio',
    url: 'https://www.tiktok.com/@buildlyio',
    contentTypes: [
        {
            type: 'shorts',
            description: 'Quick development tips and AI insights'
        },
        {
            type: 'tutorials',
            description: 'Bite-sized technical tutorials'
        },
        {
            type: 'trends',
            description: 'Tech industry trends and commentary'
        }
    ]
};

// LinkedIn Configuration (for potential future use)
const LINKEDIN_CONFIG = {
    company: 'buildly',
    url: 'https://www.linkedin.com/company/buildly',
    contentTypes: [
        {
            type: 'articles',
            description: 'Long-form thought leadership content'
        },
        {
            type: 'posts',
            description: 'Professional insights and industry updates'
        }
    ]
};

// Twitter/X Configuration
const TWITTER_CONFIG = {
    handle: '@buildlyio',
    url: 'https://twitter.com/buildlyio',
    contentTypes: [
        {
            type: 'threads',
            description: 'Technical insights and product development threads'
        },
        {
            type: 'updates',
            description: 'Real-time product updates and announcements'
        }
    ]
};

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        YOUTUBE_CONFIG,
        INSTAGRAM_CONFIG,
        TIKTOK_CONFIG,
        LINKEDIN_CONFIG,
        TWITTER_CONFIG
    };
} else {
    // Browser environment
    window.BuildlySocialConfig = {
        YOUTUBE_CONFIG,
        INSTAGRAM_CONFIG,
        TIKTOK_CONFIG,
        LINKEDIN_CONFIG,
        TWITTER_CONFIG
    };
}

/**
 * Utility functions for managing social media content
 */
class SocialMediaManager {
    
    /**
     * Generate playlist HTML for YouTube section
     */
    static generatePlaylistHTML(playlist) {
        const recentlyUpdatedBadge = playlist.isRecentlyUpdated ? 
            `<div class="flex justify-center items-center gap-2 mb-4">
                <span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Recently Updated</span>
            </div>` : '';
            
        return `
            <div class="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div class="w-16 h-16 bg-gradient-to-br ${playlist.color} rounded-full flex items-center justify-center mb-6 mx-auto">
                    <span class="emoji text-2xl">${playlist.emoji}</span>
                </div>
                <h3 class="text-xl font-bold text-buildly-dark text-center mb-4">${playlist.title}</h3>
                <p class="text-gray-600 text-center mb-6">${playlist.description}</p>
                ${recentlyUpdatedBadge}
                <div class="text-center">
                    <a href="https://www.youtube.com/playlist?list=${playlist.id}" target="_blank" 
                       class="${playlist.buttonColor} text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        Watch Playlist
                    </a>
                </div>
            </div>
        `;
    }
    
    /**
     * Update playlists dynamically (for future API integration)
     */
    static async updatePlaylists() {
        try {
            // This would integrate with YouTube Data API v3 in the future
            // For now, it uses the static configuration
            const container = document.getElementById('youtube-playlists');
            if (!container) return;
            
            let playlistHTML = '';
            
            YOUTUBE_CONFIG.playlists.forEach(playlist => {
                playlistHTML += this.generatePlaylistHTML(playlist);
            });
            
            // Add the "Coming Soon" placeholder
            playlistHTML += `
                <div class="bg-gray-50 rounded-xl p-8 shadow-sm border-2 border-dashed border-gray-300">
                    <div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <span class="emoji text-2xl">➕</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-600 text-center mb-4">More Content Coming</h3>
                    <p class="text-gray-500 text-center mb-6">We're constantly creating new playlists and content categories</p>
                    <div class="text-center">
                        <span class="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm">Stay Tuned</span>
                    </div>
                </div>
            `;
            
            container.innerHTML = playlistHTML;
            
            console.log('Playlists updated successfully');
            
        } catch (error) {
            console.error('Error updating playlists:', error);
        }
    }
    
    /**
     * Check for new playlists (placeholder for future API integration)
     */
    static async checkForNewPlaylists() {
        // Future implementation would:
        // 1. Fetch current playlists from YouTube Data API
        // 2. Compare with stored configuration
        // 3. Update configuration file if new playlists found
        // 4. Trigger content refresh
        
        console.log('Checking for new playlists...');
        return YOUTUBE_CONFIG.playlists;
    }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('vlog.html')) {
        SocialMediaManager.updatePlaylists();
        
        // Check for updates periodically (every 5 minutes in production)
        // setInterval(SocialMediaManager.checkForNewPlaylists, 5 * 60 * 1000);
    }
});

/**
 * INSTRUCTIONS FOR UPDATING PLAYLISTS:
 * 
 * When new playlists are created on YouTube:
 * 1. Add new playlist object to YOUTUBE_CONFIG.playlists array
 * 2. Include: id, title, description, emoji, colors, tags
 * 3. Set isRecentlyUpdated: true for new playlists
 * 4. Update lastUpdated date if playlist gets new content
 * 
 * For other platforms:
 * 1. Update respective configuration objects
 * 2. Add new content types as needed
 * 3. Update URLs when accounts are created
 * 
 * Future API Integration:
 * - YouTube Data API v3 for automatic playlist detection
 * - Instagram Basic Display API for content updates
 * - TikTok for Developers API for video content
 * - Social media management tools for cross-platform updates
 */