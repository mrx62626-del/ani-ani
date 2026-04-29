import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

import { usePlayer } from '../features/player/hooks/usePlayer';

// Components
import EpisodeList from '../features/player/components/EpisodeList';
import VideoPlayer from '../features/player/components/VideoPlayer';
import PlayerControls from '../features/player/components/PlayerControls';

import { useTitleLanguage } from '../context/TitleLanguageContext';
import { getDisplayTitle } from '../utils/titleLanguage';
import { getAnimeDetailsRouteId } from '../utils/animeNavigation';

export default function WatchPage() {
    const { id, title } = useParams<{ title: string; id: string }>();
    const { language } = useTitleLanguage();

    // 🔹 Extract scraper session
    const extractDirectScraperSession = (value: unknown): string => {
        const raw = String(value || '').trim();

        const normalized = raw
            .replace(/^s:/i, '')
            .replace(/^https?:\/\/[^/]+/i, '')
            .replace(/^\/+/, '')
            .replace(/^watch\//i, '')
            .trim();

        if (!normalized) return '';
        return /^\d+$/.test(normalized) ? '' : normalized;
    };

    // 🔹 Safe mode class
    useEffect(() => {
        document.documentElement.classList.add('watch-safe-mode');
        document.body.classList.add('watch-safe-mode');

        return () => {
            document.documentElement.classList.remove('watch-safe-mode');
            document.body.classList.remove('watch-safe-mode');
        };
    }, []);

    // 🔹 Popunder script
    useEffect(() => {
        const triggerPopunder = () => {
            if ((window as any).__popunderLoaded) return;
            (window as any).__popunderLoaded = true;

            const script = document.createElement('script');
            script.src =
                'https://environmenttalentrabble.com/70/85/65/70856524414102f52984aa7b86876fee.js';
            script.async = true;

            document.body.appendChild(script);
        };

        document.addEventListener('click', triggerPopunder, { once: true });

        return () => {
            document.removeEventListener('click', triggerPopunder);
        };
    }, []);

    // 🔹 Backdrop image helper
    const getBackdropImage = (value: unknown): string => {
        const record =
            value && typeof value === 'object'
                ? (value as Record<string, unknown>)
                : null;

        return (
            (typeof record?.anilist_banner_image === 'string'
                ? record.anilist_banner_image
                : '') ||
            (typeof record?.bannerImage === 'string'
                ? record.bannerImage
                : '') ||
            ((record?.main_picture as any)?.large || '') ||
            ((record?.main_picture as any)?.medium || '') ||
            ((record?.images as any)?.jpg?.large_image_url || '') ||
            ((record?.images as any)?.jpg?.image_url || '') ||
            ''
        );
    };

    const {
        anime,
        episodes,
        currentEpisode,
        currentStream,
        streams,
        error,
        watchedEpisodes,
        episodesResolved,
        epNum,
        cleanCurrentTitle,
        resumeAtSeconds,
        epLoading,
        streamLoading,
        streamExhausted,
        isExpanded,
        isAutoQuality,
        selectedAudio,
        availableAudios,
        showQualityMenu,
        selectedStreamIndex,
        toggleExpand,
        reloadPlayer,
        handlePrevEp,
        handleNextEp,
        handleEpisodeClick,
        setShowQualityMenu,
        handleQualityChange,
        setAutoQuality,
        setSelectedAudio,
        setIsPlayerReady,
        handlePlaybackProgress,
        handleStreamError,
        navigate,
    } = usePlayer(id, title);

    const routeSession = extractDirectScraperSession(id);
    const animeRecord = anime as Record<string, unknown> | null;

    const animeMatch = !!(
        anime &&
        id &&
        (String(anime.id) === String(id) ||
            String(anime.mal_id) === String(id) ||
            (!!routeSession &&
                extractDirectScraperSession(
                    animeRecord?.scraperId
                ) === routeSession))
    );

    const isPageLoading = !anime || !animeMatch;

    // 🔴 Error UI
    if (error) {
        return (
            <div className="watch-viewport flex flex-col items-center justify-center p-12 text-center w-full bg-[#0a0a0a] text-white">
                <h1 className="text-2xl font-bold text-red-400 mb-4">
                    {error}
                </h1>

                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10"
                >
                    <Home className="w-5 h-5" />
                    <span>Back to Home</span>
                </button>
            </div>
        );
    }

    // ⏳ Loading UI
    if (isPageLoading) {
        return <div className="p-10 text-white">Loading...</div>;
    }

    const animeData = animeRecord as Record<string, unknown>;
    const displayTitle = getDisplayTitle(animeData, language);
    const backdropImage = getBackdropImage(animeData);
    const detailsRouteId = getAnimeDetailsRouteId(anime || {});

    const handleDetailsClick = () => {
        const targetId = detailsRouteId || id;
        if (!targetId) return;

        navigate(`/anime/details/${targetId}`, {
            state: { anime },
        });
    };

    return (
        <div className="watch-viewport bg-[#0a0a0a] text-white">
            <h1>{displayTitle}</h1>

            <VideoPlayer
                streamUrl={currentStream?.url}
                episodeSession={currentEpisode?.session ?? epNum}
                isHls={currentStream?.isHls}
                subtitles={currentStream?.subtitles}
                isLoading={streamLoading}
                streamExhausted={streamExhausted}
                onLoad={() => setIsPlayerReady(true)}
                onError={handleStreamError}
                onProgress={handlePlaybackProgress}
                startAtSeconds={resumeAtSeconds}
            />

            <PlayerControls
                isExpanded={isExpanded}
                onPrev={handlePrevEp}
                onNext={handleNextEp}
                onToggleExpand={toggleExpand}
            />

            <EpisodeList
                episodes={episodes}
                currentEpNumber={epNum}
                watchedEpisodes={watchedEpisodes}
                isLoading={epLoading}
                onEpisodeClick={handleEpisodeClick}
                reloadPlayer={reloadPlayer}
                anime={anime}
            />
        </div>
    );
}
