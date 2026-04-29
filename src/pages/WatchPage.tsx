import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { usePlayer } from '../features/player/hooks/usePlayer';

import EpisodeList from '../features/player/components/EpisodeList';
import VideoPlayer from '../features/player/components/VideoPlayer';
import PlayerControls from '../features/player/components/PlayerControls';
import { useTitleLanguage } from '../context/TitleLanguageContext';
import { getDisplayTitle } from '../utils/titleLanguage';
import { getAnimeDetailsRouteId } from '../utils/animeNavigation';

export default function WatchPage() {
    const { id, title } = useParams<{ title: string; id: string }>();
    const { language } = useTitleLanguage();

    const sidebarAdRef = useRef<HTMLDivElement | null>(null);

    // ✅ SAFE MODE
    useEffect(() => {
        document.documentElement.classList.add('watch-safe-mode');
        document.body.classList.add('watch-safe-mode');
        return () => {
            document.documentElement.classList.remove('watch-safe-mode');
            document.body.classList.remove('watch-safe-mode');
        };
    }, []);

    // ✅ POPUNDER
    useEffect(() => {
        const triggerPopunder = () => {
            if ((window as any).__popunderLoaded) return;
            (window as any).__popunderLoaded = true;

            const script = document.createElement('script');
            script.src = "https://environmenttalentrabble.com/70/85/65/70856524414102f52984aa7b86876fee.js";
            script.async = true;

            document.body.appendChild(script);
        };

        document.addEventListener('click', triggerPopunder, { once: true });

        return () => {
            document.removeEventListener('click', triggerPopunder);
        };
    }, []);

    // ✅ SIDEBAR BANNER (above "Currently Airing")
    useEffect(() => {
        if (!sidebarAdRef.current) return;

        sidebarAdRef.current.innerHTML = '';

        const script1 = document.createElement('script');
        script1.innerHTML = `
            atOptions = {
                key: 'abf188c57a549b78887613e73fd37877',
                format: 'iframe',
                height: 250,
                width: 300,
                params: {}
            };
        `;

        const script2 = document.createElement('script');
        script2.src = "https://environmenttalentrabble.com/abf188c57a549b78887613e73fd37877/invoke.js";
        script2.async = true;

        sidebarAdRef.current.appendChild(script1);
        sidebarAdRef.current.appendChild(script2);

        return () => {
            if (sidebarAdRef.current) sidebarAdRef.current.innerHTML = '';
        };
    }, []);

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
        navigate
    } = usePlayer(id, title);

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="watch-viewport relative flex flex-col w-full bg-[#0a0a0a] text-white overflow-hidden pt-14">

            <div className="flex-1 flex flex-col md:flex-row gap-6 px-4 md:px-10">

                {/* LEFT SIDE (PLAYER) */}
                <div className="flex-1 flex flex-col">
                    <div className="aspect-video">
                        <VideoPlayer
                            streamUrl={currentStream?.url}
                            episodeSession={currentEpisode?.session ?? epNum}
                            isHls={currentStream?.isHls}
                            subtitles={currentStream?.subtitles}
                            isLoading={streamLoading}
                            streamExhausted={streamExhausted}
                            hasPlayableSource={!!currentStream?.url}
                            onLoad={() => setIsPlayerReady(true)}
                            onError={handleStreamError}
                            onProgress={handlePlaybackProgress}
                            startAtSeconds={resumeAtSeconds}
                        />
                    </div>

                    <PlayerControls
                        isExpanded={isExpanded}
                        canPrev={epNum !== '1'}
                        isAutoQuality={isAutoQuality}
                        selectedStreamIndex={selectedStreamIndex}
                        streams={streams}
                        selectedAudio={selectedAudio}
                        availableAudios={availableAudios}
                        showQualityMenu={showQualityMenu}
                        onPrev={handlePrevEp}
                        onNext={handleNextEp}
                        onToggleExpand={toggleExpand}
                        setShowQualityMenu={setShowQualityMenu}
                        onQualityChange={handleQualityChange}
                        onSetAutoQuality={setAutoQuality}
                        onAudioChange={setSelectedAudio}
                    />
                </div>

                {/* RIGHT SIDE (EPISODES + AD) */}
                {!isExpanded && (
                    <div className="flex flex-col w-full md:w-[340px] shrink-0">

                        {/* 🔥 AD HERE (above Currently Airing) */}
                        <div className="w-full flex justify-center mb-3">
                            <div ref={sidebarAdRef} />
                        </div>

                        <EpisodeList
                            episodes={episodes}
                            currentEpNumber={epNum}
                            watchedEpisodes={watchedEpisodes}
                            isLoading={epLoading || !episodesResolved}
                            onEpisodeClick={handleEpisodeClick}
                            reloadPlayer={reloadPlayer}
                            anime={anime}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
