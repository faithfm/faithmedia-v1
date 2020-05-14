<template>
  <v-app dark id="player">
    <v-content>
      <v-container>
        <!-- <div>{{prefilters}}</div> -->
        <player-title-bar
          :itemMenu="prefilters"
          @reload="reloadContentDb"
          @applyroutefilter="applyRouteFilter"
        ></player-title-bar>
        <player-info-panel :trackInfo="getTrackInfo"></player-info-panel>
        <player-search-bar 
          :searchString.sync="searchString"
          @update:searchString="searchPlaylist"
        ></player-search-bar>
        <player-playlist-panel
          :playlist="displayedContent"
          :selectedTrackFile="selectedTrackFile"
          :indexFile="indexFile"
          :isLoading="isLoading"
          :totalResultsAvailable="filteredContent.length"
          :songReviews.sync="songReviews"
          @selecttrack="selectTrack"
          @playtrack="play"
          @showmoreresults="showMoreResults"
          @showallresults="showAllResults"
          @submitSongReview="submitSongReview"
        ></player-playlist-panel>
        <player-controls-bars
          :loop="loop"
          :shuffle="shuffle"
          :progress="progress"
          :playing="playing"
          :trackInfo="getTrackInfo"
          @playtrack="play"
          @pausetrack="pause"
          @stoptrack="stop"
          @skiptrack="skip"
          @toggleloop="toggleLoop"
          @toggleshuffle="toggleShuffle"
          @updateseek="setSeek"
        ></player-controls-bars>
      </v-container>
    </v-content>
  </v-app>
</template>
 
<script>
import { SmartSearchFilter } from "../SmartSearchFilter";
import { mp3Url } from "../DbContentUrls";
import PlayerTitleBar from "./PlayerTitleBar.vue"; // IMPORT the component
import PlayerPlaylistPanel from "./PlayerPlaylistPanel.vue"; // IMPORT the component
import PlayerControlsBars from "./PlayerControlsBars.vue"; // IMPORT the component
import PlayerInfoPanel from "./PlayerInfoPanel.vue"; // IMPORT the component
import PlayerSearchBar from "./PlayerSearchBar.vue"; // IMPORT the component
import axios from "axios";
import NoSleep from "NoSleep.js";
import LZString from "lz-string"

// DELETEME
function doesFileExist(urlToFile) {
  var xhr = new XMLHttpRequest();
  xhr.open("HEAD", urlToFile, false);
  xhr.send();

  if (xhr.status == "404") {
    return false;
  } else {
    return true;
  }
}
// DELTEME

export default {
  components: {
    PlayerTitleBar, // REGISTER the component
    PlayerPlaylistPanel,
    PlayerControlsBars,
    PlayerInfoPanel,
    PlayerSearchBar
  },
  data() {
    return {
      smartSearchFilter: new SmartSearchFilter(
        "",
        "file|series|numbers|content|guests|tags"
      ),
      prefilters: [],
      contentDb: [],
      prefilteredContent: [],
      filteredContent: [],
      displayedContent: [],
      songReviews: [],
      songReviewsAllowed: false,
      searchString: "",
      selectedTrack: null,      // *** DEPRECIATING THIS ONE
      selectedTrackFile: "",
      howlers: {}, // object containing howl instances, indexed by filename
      indexFile: "", // filename (index) of currently-playing track (if any).  Intending to replace "index" with this prop
      index: 0,
      playing: false,
      loop: false,
      shuffle: false,
      seek: 0,
      noSleep: new NoSleep()
    };
  },
  computed: {
    isLoading() {
      if (!this.prefilters || !this.contentDb)
        return true
      else
        return false
    },
    currentHowler() {
      return this.howlers[this.indexFile];
    },
    currentTrack() {     // *** COMBINE WITH getTrackInfo ***
      const indexFile = this.indexFile
      if (this.contentDb)
        return this.contentDb.find(track => track.file == indexFile);
    },
    progress() {
      if (!this.currentHowler || this.currentHowler.duration() === 0) return 0;
      return this.seek / this.currentHowler.duration();
    },
    getTrackInfo() {
      let guests = "",
        content = "",
        seek = this.seek,
        duration = 0;
      if (this.currentTrack) {
        guests = this.currentTrack.guests;
        content = this.currentTrack.content;
      }
      if (this.currentHowler) {
        duration = this.currentHowler.duration();
      }
      return {
        guests,
        content,
        seek,
        duration
      };
    }
  },
  watch: {
    playing(playing) {
      this.seek = this.currentHowler.seek();
      let updateSeek;
      if (playing) {
        updateSeek = setInterval(() => {
          this.seek = this.currentHowler.seek();
        }, 250);
      } else {
        clearInterval(updateSeek);
      }
    },
    $route(to, from) {
      this.applyRouteFilter();
    }
  },
  created() {
    Howler.mute(false).volume(1.0);

    // load pre-filters (from localstorage or API)
    const vm = this
    const ls = localStorage
    const useLocalStorage = (localStorage.enableDevCache ? true : false);

    if (useLocalStorage && localStorage.prefilters) {
      try { this.prefilters = JSON.parse(localStorage.prefilters) }
      catch(error) { this.prefilters = [] } // clear data on error
      this.applyRouteFilter()
    }
    if (!this.prefilters || this.prefilters.length < 1) {
      axios.get("/api/prefilters")
        .then(function (response) {
          vm.prefilters = response.data
          try { ls.prefilters = JSON.stringify(response.data) }
          catch (error) { this.prefilters = [] } // clear data on error 
          vm.applyRouteFilter()
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    // load song-reviews (from API only)
    axios.get("/api/songreviews")
      .then(function (response) {
        vm.songReviews = response.data
        vm.songReviewsAllowed = true
      })
      .catch(function (error) {
        vm.songReviewsAllowed = false
        console.log(error);
      });

    this.loadContentDb()
  },
  methods: {
    selectTrack(file) {
      this.selectedTrackFile = file;
    },
    play(file) {
      file = file || this.indexFile || (this.displayedContent[0] ? this.displayedContent[0].file : null)    // try to play (in order): specified filename, indexFile, first displayed file...
      if (!file) return                                                                                      // ... OR nothing to play
      if (this.currentHowler) {
        // stop playing if different file
        if (file != this.indexFile) 
          this.currentHowler.stop();
        // don't do anything if already playing
        if (this.currentHowler.playing())
          return;
      }
      // get howl instance
      let howl = this.howlers[file]
      // create new instance if required
      if (!howl) {
        howl = new Howl({
          src: mp3Url(file, this.$config),
          onend: () => {
            if (this.loop) {
              this.play(file);
            } else {
              this.skip("next");
            }
          },
          preload: false,
          html5: true
        });
        this.$set(this.howlers, file, howl)
      }
      // load if required
      if (howl.state() == "unloaded") 
        howl.load();

      howl.play();
      this.noSleep.enable();

      this.playing = true;
      this.indexFile = file;
      this.selectedTrackFile = file;
    },
    pause() {
      this.currentHowler.pause();
      this.playing = false;
      this.noSleep.disable();
    },
    stop() {
      this.currentHowler.stop();
      this.playing = false;
      this.noSleep.disable();
    },
    skip(direction) {
        if (this.displayedContent.length == 0)
          this.stop()   // no files to play
      // let index = 0,
        // lastIndex = this.displayedContent.length - 1;

      let index = -1
      if (this.shuffle) {
        // randomly lookup a new item (keep trying if random song same as existing song... unless less-than-two-songs available)
        index = -1;
        while (index == -1 || this.displayedContent[index].file === this.indexFile || this.displayedContent.length < 2 ) {
          index = Math.round(Math.random() * (this.displayedContent.length - 1));
        }
      } else if (direction === "next") {
        const currentTrackIndex = this.displayedContent.findIndex(track => track.file == this.indexFile);
        // if (currentTrackIndex == -1)
        index = currentTrackIndex + 1;
        if (index >= this.displayedContent.length)
          index = 0;
      } else {
        const currentTrackIndex = this.displayedContent.findIndex(track => track.file == this.indexFile);
        index = currentTrackIndex - 1;
        if (index < 0)
          index = this.displayedContent.length - 1;
      }
      this.play(this.displayedContent[index].file)
      // this.skipTo(index);
    },
    // skipTo(index) {
    //   if (this.currentTrack) {
    //     this.currentTrack.howl.stop();
    //     this.noSleep.disable();
    //   }
    //   this.play(index);
    // },
    toggleLoop(value) {
      this.loop = value;
    },
    toggleShuffle(value) {
      this.shuffle = value;
    },
    setSeek(percents) {
      if (this.currentHowler.playing()) {
        this.currentHowler.seek((this.currentHowler.duration() / 100) * percents);
      }
    },
    loadContentDb() {
      const vm = this
      const ls = localStorage

      const useLocalStorage = (localStorage.enableDevCache ? true : false);

      if (useLocalStorage && localStorage.contentDb) {
        try { this.contentDb = JSON.parse(LZString.decompressFromUTF16(localStorage.contentDb)) }
        catch(error) { vm.contentDb = [] } // clear data on error
        this.applyRouteFilter()
      }
      if (!this.contentDb || this.contentDb.length < 1) {
        axios.get("/api/content")
          .then(function (response) {
            vm.contentDb = response.data
            ls.removeItem('contentDb')
            if (useLocalStorage) {
              try { ls.contentDb = LZString.compressToUTF16(JSON.stringify(response.data)) }
              catch (error) { vm.contentDb = [] } // clear data on error 
            }
            vm.applyRouteFilter()
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
    reloadContentDb() {
      this.contentDb = ""
      localStorage.contentDb = ""
      this.loadContentDb()
    },
    searchPlaylist() {
      let filteredContent = [];
      if (
        this.searchString === "" ||
        this.searchString === null ||
        !this.searchString
      )
        filteredContent = this.prefilteredContent;
      else {
        this.smartSearchFilter.parse(this.searchString);
        filteredContent = this.smartSearchFilter.filter(
          this.prefilteredContent
        );
      }
      console.log(this.smartSearchFilter.filterOpsDescription);
      this.filteredContent = filteredContent;
      this.displayedContent = filteredContent.slice(0, 100); // Initially show only the first 100 items
    },
    showMoreResults() {
      // show 100x more results
      let currentResultCount = this.displayedContent.length;
      this.displayedContent = this.filteredContent.slice(
        0,
        currentResultCount + 100
      );
    },
    showAllResults() {
      // copy of ALL of filteredPlist
      this.displayedContent = this.filteredContent;
    },
    applyRouteFilter() {
      let prefilterSearchString = "";
      if (this.$route.params.filter)
        prefilterSearchString = this.prefilters.find(
          f => f.slug == this.$route.params.filter
        ).filter;
      this.searchString = "";
      this.prefilteredContent = new SmartSearchFilter(
        prefilterSearchString,
        "file|series|numbers|content|guests|tags"
      ).filter(this.contentDb);
      this.searchPlaylist();
    },
    submitSongReview(file, rating = null, comments = null) {
      if (!this.songReviewsAllowed) return "Not allowed"; // not allowed

      let fields = { file, rating, comments };
      fields = Object.entries(fields).reduce((a,[k,v]) => (v === null ? a : {...a, [k]:v}), {})   // we don't want to update null (default) fields - remove them - ref: https://stackoverflow.com/questions/286141/remove-blank-attributes-from-an-object-in-javascript/57625661#57625661

      // submit song-reviews
      const vm = this;
      axios
        .post('/api/songreviews', fields)
        .then(function(response) {
          // update songReviews data if successful
          const foundIndex = vm.songReviews.findIndex(x => x.id == response.data.id)
          if (foundIndex != -1)
            vm.$set(vm.songReviews, foundIndex, response.data);
          else
            vm.$set(vm.songReviews, vm.songReviews.length, response.data);
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
};
</script>