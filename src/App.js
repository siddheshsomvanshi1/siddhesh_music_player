import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faForward,
  faBackward,
  faVolumeUp,
  faVolumeMute,
  faBars,
  faTimes,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./App.css";

const App = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState("For You");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [accentColor, setAccentColor] = useState("#000000"); // Initial background color to black
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(
          "https://cms.samespace.com/items/songs"
        );
        const fetchedSongs = response.data.data.map((song, index) => ({
          ...song,
          duration: getFormattedDuration(index),
        }));
        setSongs(fetchedSongs);
        setFilteredSongs(fetchedSongs);
        if (fetchedSongs.length > 0) {
          setCurrentSong(fetchedSongs[0]);
          autoPlayFirstSong(fetchedSongs[0]);
        }
      } catch (error) {
        console.error("There was an error fetching the songs!", error);
      }
    };

    fetchSongs();
  }, []);

  const autoPlayFirstSong = async (song) => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      audioPlayer.src = song.url;
      try {
        await audioPlayer.play();
        setIsPlaying(true);
        setAccentColor(song.accent); // Update accentColor on autoplay
      } catch (error) {
        console.error("Error playing the audio:", error);
      }
    }
  };

  useEffect(() => {
    const audioPlayer = audioRef.current;

    const updateProgress = () => {
      if (audioPlayer && audioPlayer.currentTime && audioPlayer.duration) {
        setProgress((audioPlayer.currentTime / audioPlayer.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setCurrentSong((prevSong) => ({
        ...prevSong,
        duration: Math.floor(audioPlayer.duration),
      }));
    };

    if (audioPlayer) {
      audioPlayer.addEventListener("timeupdate", updateProgress);
      audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        audioPlayer.removeEventListener("timeupdate", updateProgress);
        audioPlayer.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [currentSong]);

  const getFormattedDuration = (index) => {
    const durations = [
      "3:17",
      "2:20",
      "1:37",
      "1:54",
      "0:55",
      "2:17",
      "2:20",
      "2:58",
    ];
    const [minutes, seconds] = durations[index].split(":");
    return parseInt(minutes) * 60 + parseInt(seconds);
  };

  const handleSongClick = async (song) => {
    setCurrentSong(song);
    setAccentColor(song.accent); // Set accentColor on song click
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      audioPlayer.src = song.url;
      try {
        await audioPlayer.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing the audio:", error);
      }
    }
    setIsSidebarOpen(false); // Close sidebar when a song is clicked
  };

  const togglePlayback = async () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      if (isPlaying) {
        audioPlayer.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioPlayer.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error playing the audio:", error);
        }
      }
    }
  };

  const handleNext = () => {
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    handleSongClick(songs[nextIndex]);
  };

  const handlePrevious = () => {
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    const previousIndex = (currentIndex - 1 + songs.length) % songs.length;
    handleSongClick(songs[previousIndex]);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    const query = event.target.value.toLowerCase();
    const filtered = songs.filter(
      (song) =>
        song.name.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );
    setFilteredSongs(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "Top Tracks") {
      setFilteredSongs(songs.filter((song) => song.top_track));
    } else {
      setFilteredSongs(songs);
    }
  };

  const handleProgressChange = (event) => {
    const audioPlayer = audioRef.current;
    const newProgress = event.target.value;
    setProgress(newProgress);
    if (audioPlayer) {
      audioPlayer.currentTime = (newProgress / 100) * audioPlayer.duration;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    setVolume(newVolume);
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      audioPlayer.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      if (isMuted) {
        audioPlayer.muted = false;
        setIsMuted(false);
      } else {
        audioPlayer.muted = true;
        setIsMuted(true);
      }
    }
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (!currentSong) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app" style={{ backgroundColor: accentColor }}>
      <div className="header">
        <div className="spotify-logo">
          <img
            src="spotifylogo.jpg"
            alt="Spotify Logo"
            className="logo-image"
          />
        </div>
        <button className="hamburger" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} size="lg" />
        </button>
      </div>
      <div
        className={`sidebar ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <div className="left">
          <div className="tabs">
            <h2
              className={`font-bold text-xl cursor-pointer ${
                activeTab === "For You" ? "active" : ""
              }`}
              onClick={() => handleTabChange("For You")}
            >
              For You
            </h2>
            <h2
              className={`font-bold text-xl cursor-pointer ${
                activeTab === "Top Tracks" ? "active" : ""
              }`}
              onClick={() => handleTabChange("Top Tracks")}
            >
              Top Tracks
            </h2>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search Song, Artist"
            className="search-bar"
          />
          <ul className="song-list">
            {filteredSongs.map((song, index) => (
              <li
                key={index}
                className={`song-item ${
                  currentSong.id === song.id ? "active" : ""
                }`}
                onClick={() => handleSongClick(song)}
              >
                <img
                  src={`https://cms.samespace.com/assets/${song.cover}`}
                  alt={song.name}
                  className="song-image"
                />
                <div className="song-info">
                  <p className="song-title">{song.name}</p>
                  <p className="song-artist">{song.artist}</p>
                </div>
                <p className="song-duration">{formatDuration(song.duration)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="login-circle">
          <button className="login-icon">
            <img
              src="Siddhesh_Somvanshi_photo.png"
              alt="Siddhesh"
              className="user-image"
            />
          </button>
        </div>
      </div>
      <div
        className={`player ${!isSidebarOpen ? "player-open" : ""}`}
        style={{
          width: isSidebarOpen ? "70%" : "72%",
          height: "404px",
          transition: "width 0.3s ease",
        }}
      >
        <h1 className="song-title">{currentSong.name}</h1>
        <h2 className="artist-name">{currentSong.artist}</h2>
        <div className="album-art">
          <img
            src={`https://cms.samespace.com/assets/${currentSong.cover}`}
            alt={currentSong.name}
          />
        </div>
        <audio ref={audioRef} />
        <div className="progress-bar-container">
          <input
            type="range"
            value={progress}
            onChange={handleProgressChange}
            className="progress-bar"
          />
        </div>
        <div className="controls">
          <button onClick={handlePrevious} className="control-button">
            <FontAwesomeIcon icon={faBackward} size="lg" />
          </button>
          <button
            onClick={togglePlayback}
            className="control-button play-button"
          >
            {isPlaying ? (
              <FontAwesomeIcon icon={faPause} size="lg" />
            ) : (
              <FontAwesomeIcon icon={faPlay} size="lg" />
            )}
          </button>
          <button onClick={handleNext} className="control-button">
            <FontAwesomeIcon icon={faForward} size="lg" />
          </button>
          <button onClick={toggleMute} className="control-button volume-button">
            {isMuted ? (
              <FontAwesomeIcon icon={faVolumeMute} size="lg" />
            ) : (
              <FontAwesomeIcon icon={faVolumeUp} size="lg" />
            )}
          </button>
        </div>
      </div>
      <div className={`menu ${isMenuOpen ? "menu-open" : ""}`}>
        <div className="menu-dropdown">
          <ul className="song-menu-list">
            {songs.map((song, index) => (
              <li
                key={index}
                className={`song-menu-item ${
                  currentSong.id === song.id ? "active" : ""
                }`}
                onClick={() => {
                  handleSongClick(song);
                  toggleMenu();
                }}
              >
                {song.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
