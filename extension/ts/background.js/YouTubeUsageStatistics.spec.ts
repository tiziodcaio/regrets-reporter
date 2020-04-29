import { assert } from "chai";
import {
  YouTubeUsageStatistics,
  YouTubeUsageStatisticsUpdate,
} from "./YouTubeUsageStatistics";
import { youtubeVisitWatchPageAndStartPlaying10hOfSilenceVideo } from "./fixtures/ReportSummarizer/youtubeVisitWatchPageAndStartPlaying10hOfSilenceVideo";
import { youtubeVisitWatchPageAndNavigateToFirstUpNext } from "./fixtures/ReportSummarizer/youtubeVisitWatchPageAndNavigateToFirstUpNext";
import { NavigationBatch } from "./NavigationBatchPreprocessor";
import { mockLocalStorage } from "./lib/mockLocalStorage";
import { ReportSummarizer } from "./ReportSummarizer";
import { ActiveTabDwellTimeMonitor } from "./ActiveTabDwellTimeMonitor";
import { Store } from "./Store";
import { Tabs } from "webextension-polyfill-ts";
import Tab = Tabs.Tab;
const reportSummarizer = new ReportSummarizer();
const activeTabDwellTimeMonitor = new ActiveTabDwellTimeMonitor();

const summarizeUpdate = async (
  navigationBatchesByUuid: {
    [navigationUuid: string]: NavigationBatch;
  },
  youTubeUsageStatistics: YouTubeUsageStatistics,
): Promise<YouTubeUsageStatisticsUpdate> => {
  const navUuids = Object.keys(navigationBatchesByUuid);
  for (const navUuid of navUuids) {
    await youTubeUsageStatistics.seenNavigationBatch(
      navigationBatchesByUuid[navUuid],
    );
  }
  const mockTab = { url: "https://www.youtube.com/watch?v=g4mHPeMGTJM" } as Tab;
  await youTubeUsageStatistics.seenTabActiveDwellTimeIncrement(mockTab, 1500);
  return await youTubeUsageStatistics.summarizeUpdate();
};

describe("YouTubeUsageStatistics", function() {
  it("should exist", async function() {
    mockLocalStorage.reset();
    const store = new Store(mockLocalStorage);
    const youTubeUsageStatistics = new YouTubeUsageStatistics(
      store,
      reportSummarizer,
      activeTabDwellTimeMonitor,
    );
    await youTubeUsageStatistics.hydrate();
    assert.isObject(youTubeUsageStatistics);
  });

  it("before any usage", async function() {
    mockLocalStorage.reset();
    const store = new Store(mockLocalStorage);
    const youTubeUsageStatistics = new YouTubeUsageStatistics(
      store,
      reportSummarizer,
      activeTabDwellTimeMonitor,
    );
    await youTubeUsageStatistics.hydrate();
    const summarizedUpdate = await summarizeUpdate({}, youTubeUsageStatistics);

    assert.deepEqual(summarizedUpdate, {
      amount_of_days_with_at_least_one_youtube_visit: 0,
      amount_of_time_with_an_active_youtube_tab: 1500,
      amount_of_youtube_watch_pages_loaded_by_category: {
        in_total: 0,
        via_search_results: 0,
        via_non_search_algorithmic_recommendations_content: 0,
        via_recommendations_with_an_explicit_query_or_constraint_to_optimize_for: 0,
      },
      amount_of_days_with_at_least_one_youtube_watch_page_load_by_category: {
        in_total: 0,
        via_search_results: 0,
        via_non_search_algorithmic_recommendations_content: 0,
        via_recommendations_with_an_explicit_query_or_constraint_to_optimize_for: 0,
      },
    });
  });

  it("fixture: youtubeVisitWatchPageAndStartPlaying10hOfSilenceVideo", async function() {
    mockLocalStorage.reset();
    const store = new Store(mockLocalStorage);
    const youTubeUsageStatistics = new YouTubeUsageStatistics(
      store,
      reportSummarizer,
      activeTabDwellTimeMonitor,
    );
    await youTubeUsageStatistics.hydrate();
    const summarizedUpdate = await summarizeUpdate(
      youtubeVisitWatchPageAndStartPlaying10hOfSilenceVideo,
      youTubeUsageStatistics,
    );

    assert.deepEqual(summarizedUpdate, {
      amount_of_days_with_at_least_one_youtube_visit: 1,
      amount_of_time_with_an_active_youtube_tab: 1500,
      amount_of_youtube_watch_pages_loaded_by_category: {
        in_total: 1,
        via_search_results: 0,
        via_non_search_algorithmic_recommendations_content: 0,
        via_recommendations_with_an_explicit_query_or_constraint_to_optimize_for: 0,
      },
      amount_of_days_with_at_least_one_youtube_watch_page_load_by_category: {
        in_total: 1,
        via_search_results: 0,
        via_non_search_algorithmic_recommendations_content: 0,
        via_recommendations_with_an_explicit_query_or_constraint_to_optimize_for: 0,
      },
    });

    const youTubeUsageStatistics2 = new YouTubeUsageStatistics(
      store,
      reportSummarizer,
      activeTabDwellTimeMonitor,
    );
    await youTubeUsageStatistics2.hydrate();

    // Before persist
    const summarizedUpdate2 = await youTubeUsageStatistics2.summarizeUpdate();

    assert.deepEqual(summarizedUpdate2, {
      amount_of_days_with_at_least_one_youtube_visit: 0,
      amount_of_time_with_an_active_youtube_tab: 0,
      amount_of_youtube_watch_pages_loaded_by_category: {
        in_total: 0,
        via_search_results: 0,
        via_non_search_algorithmic_recommendations_content: 0,
        via_recommendations_with_an_explicit_query_or_constraint_to_optimize_for: 0,
      },
      amount_of_days_with_at_least_one_youtube_watch_page_load_by_category: {
        in_total: 0,
        via_search_results: 0,
        via_non_search_algorithmic_recommendations_content: 0,
        via_recommendations_with_an_explicit_query_or_constraint_to_optimize_for: 0,
      },
    });

    // After persist + re-hydration
    await youTubeUsageStatistics.persist();
    await youTubeUsageStatistics2.hydrate();
    const summarizedUpdate3 = await youTubeUsageStatistics2.summarizeUpdate();

    assert.deepEqual(summarizedUpdate3, {
      amount_of_days_with_at_least_one_youtube_visit: 1,
      amount_of_time_with_an_active_youtube_tab: 1500,
      amount_of_youtube_watch_pages_loaded_by_category: {
        in_total: 1,
        via_search_results: 0,
        via_non_search_algorithmic_recommendations_content: 0,
        via_recommendations_with_an_explicit_query_or_constraint_to_optimize_for: 0,
      },
      amount_of_days_with_at_least_one_youtube_watch_page_load_by_category: {
        in_total: 1,
        via_search_results: 0,
        via_non_search_algorithmic_recommendations_content: 0,
        via_recommendations_with_an_explicit_query_or_constraint_to_optimize_for: 0,
      },
    });
  });

  it("fixture: youtubeVisitWatchPageAndNavigateToFirstUpNext", async function() {
    mockLocalStorage.reset();
    const store = new Store(mockLocalStorage);
    const youTubeUsageStatistics = new YouTubeUsageStatistics(
      store,
      reportSummarizer,
      activeTabDwellTimeMonitor,
    );
    await youTubeUsageStatistics.hydrate();
    const summarizedUpdate = await summarizeUpdate(
      youtubeVisitWatchPageAndNavigateToFirstUpNext,
      youTubeUsageStatistics,
    );

    assert.deepEqual(summarizedUpdate, {
      amount_of_days_with_at_least_one_youtube_visit: 1,
      amount_of_time_with_an_active_youtube_tab: 1500,
      amount_of_youtube_watch_pages_loaded_by_category: {
        in_total: 2,
        via_search_results: 0,
        via_non_search_algorithmic_recommendations_content: 1,
        via_recommendations_with_an_explicit_query_or_constraint_to_optimize_for: 0,
      },
      amount_of_days_with_at_least_one_youtube_watch_page_load_by_category: {
        in_total: 1,
        via_search_results: 0,
        via_non_search_algorithmic_recommendations_content: 1,
        via_recommendations_with_an_explicit_query_or_constraint_to_optimize_for: 0,
      },
    });
  });
});
