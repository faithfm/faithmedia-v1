<template>
	<v-dialog
		fullscreen
		hide-overlay
		persistent
		transition="dialog-bottom-transition"
		:value="summaryDialog"
		@input="closeDialog"
	>
		<v-card>
			<v-toolbar
				dark
				flat
				color="red darken-4"
				style="
					position: -webkit-sticky;
					position: sticky;
					top: -1px;
					z-index: 10;
				"
			>
				<v-toolbar-title> Song Review Summary </v-toolbar-title>
				<v-spacer></v-spacer>
				<v-btn icon absolute right @click="closeDialog">
					<v-icon>mdi-close</v-icon>
				</v-btn>
			</v-toolbar>
			<v-alert v-show="!canEdit" type="error"
				>You don't have permission to edit this area.</v-alert
			>
			<v-card-text v-show="canEdit">
				<v-container>
					<v-row>
						<v-col>
							<v-container fluid class="full-width">
								<v-data-table
									:headers="headers"
									:items="songReviewsTable"
									:expanded.sync="expanded"
									:item-class="feedColour"
									item-key="file"
									dense
									show-expand
									disable-pagination
									hide-default-footer
									calculate-widths
								>
									<template v-slot:[`item.status`]="props">
										<v-edit-dialog
											:return-value.sync="props.item.status"
											class="d-flex"
											@save="updateOrCreateSummary(props.item)"
										>
											{{ props.item.status }}
											<template v-slot:input>
												<div class="mt-4 title">Status</div>
												<v-autocomplete
													v-model="props.item.status"
													:items="statusOptions"
													:rules="[requiredValue]"
													auto-select-first
													cache-items
													allow-overflow
												></v-autocomplete>
											</template>
										</v-edit-dialog>
									</template>
									<template v-slot:[`item.source`]="props">
										<v-edit-dialog
											:return-value.sync="props.item.source"
											@save="updateOrCreateSummary(props.item)"
										>
											{{ props.item.source }}
											<template v-slot:input>
												<div class="mt-4 title">Source</div>
												<v-combobox
													v-model="props.item.source"
													:items="sources"
													:item-value="(value) => !!value || ''"
													single-line
													counter
													clearable
												></v-combobox>
											</template>
										</v-edit-dialog>
									</template>
									<template v-slot:[`item.comment`]="props">
										<v-edit-dialog
											:return-value.sync="props.item.comment"
											@save="updateOrCreateSummary(props.item)"
										>
											{{ props.item.comment }}
											<template v-slot:input>
												<div class="mt-4 title">Comment</div>
												<v-text-field
													v-model="props.item.comment"
													:rules="[max255chars]"
													label="Edit"
													single-line
													counter
													style="max-width: 25em"
												></v-text-field>
											</template>
										</v-edit-dialog>
									</template>
									<template v-slot:expanded-item="{ headers, item }">
										<td :colspan="headers.length">
											<v-list dense elevation="10">
												<v-list-item-group>
													<v-list-item
														v-for="(review, id) in item.reviewComments"
														:key="id"
													>
														<v-list-item-icon>
															<v-icon small v-if="review.rating == '+'"
																>mdi-comment-check-outline</v-icon
															>
															<v-icon small v-else-if="review.rating == '-'"
																>mdi-comment-remove-outline</v-icon
															>
															<v-icon small v-else-if="review.rating == '?'"
																>mdi-comment-question-outline</v-icon
															>
															<v-icon small v-else
																>mdi-comment-off-outline</v-icon
															>
														</v-list-item-icon>
														<v-list-item-content>
															<v-list-item-subtitle
																><span class="text--primary"
																	>{{
																		review.user ? review.user.name + " - " : ""
																	}} </span
																>{{ review.comments }}</v-list-item-subtitle
															>
														</v-list-item-content>
													</v-list-item>
												</v-list-item-group>
											</v-list>
										</td></template
									></v-data-table
								></v-container
							></v-col
						></v-row
					></v-container
				></v-card-text
			></v-card
		></v-dialog
	>
</template>

<script>
import vuetifyToast from "../VuetifyToast";
import { laravelUserRestrictions } from "../LaravelUserPermissions";
import axios from "axios";

export default {
	props: {
		summaryDialog: Boolean, // two-way data-binding
		songReviews: Array,
		playlist: Array,
	},
	data() {
		return {
			headers: [
				{ text: "Song", value: "name", width: "40em" },
				{ text: "Status", value: "status", width: "10em" },
				{ text: "Source", value: "source", width: "10em" },
				{ text: "Comment", value: "comment", sortable: false, width: "25em" },
				{ text: "", value: "data-table-expand", sortable: false, width: "2em" },
			],
			statusOptions: [
				"approved",
				"approved - low intensity",
				"producers only",
				"not approved",
			],
			expanded: [],
			sources: [],
			songReviewsSummary: [],
			max255chars: (v) => v.length <= 25 || "Input too long!",
			requiredValue: (value) => !!value || "Required",
			feedColour: (item) => {
				if (item.status.includes("low intensity")) {
					return "green--text text--ligthen-2";
				} else if (item.status == "not approved") {
					return "red--text text--darken-2";
				} else if (item.status == "producers only") {
					return "blue--text text--darken-3";
				} else if (item.status == "approved") {
					return "green--text text--darken-3";
				} else {
					return "black--text";
				}
			},
		};
	},
	created() {
		// load song-reviews-summary (from API only)
		const vm = this;
		axios
			.get("/api/songreviewsummary")
			.then(function (response) {
				try {
					if (!(response.data instanceof Array)) throw "Result error"; // expecting an array
					vm.songReviewsSummary = response.data;
					let sources = new Set();
					vm.songReviewsSummary.forEach((element) => {
						let source = element.source;
						if (source) {
							sources.add(source);
						}
					});
					vm.sources = [...sources];
				} catch (error) {
					throw error;
				}
			})
			.catch(function (error) {
				vm.songReviewsSummary = []; // clear data on error
				if (error != "Error: Request failed with status code 403")
					// anticipate "403 FORBIDDEN" failures (normal response based on user permissions)
					vuetifyToast.error(error + " - song reviews Summary API");
			});
	},
	computed: {
		songReviewsTable() {
			const vm = this;
			let review = "";
			let table = [];
			vm.playlist.forEach((element) => {
				let filteredReviews = vm.songReviews.filter(
					(x) => x.file == element.file
				);
				if (filteredReviews.length === 0) {
					filteredReviews = [{ comments: "No Comments" }];
				}
				let filteredReviewsFromSummary = vm.songReviewsSummary.find(
					(y) => y.file == element.file
				);
				if (filteredReviewsFromSummary) {
					review = {
						name: element.guests + " - " + element.content,
						file: element.file,
						status: filteredReviewsFromSummary.status,
						source: filteredReviewsFromSummary.source,
						comment: filteredReviewsFromSummary.comment,
						reviewComments: filteredReviews,
					};
				} else {
					review = {
						name: element.guests + " - " + element.content,
						file: element.file,
						status: "",
						source: "",
						comment: "",
						reviewComments: filteredReviews,
					};
				}
				table.push(review);
			});
			return table;
		},
		canEdit() {
			const restrictions = laravelUserRestrictions("review-songs-summary");

			if (restrictions.error && !this.jsonErrorShownOnce) {
				vuetifyToast.error(
					"Your user profile contains an invalid permission restriction code. \nPlease contact your administrator for help."
				);
				this.jsonErrorShownOnce = true;
			}

			if (restrictions.status == "NOT PERMITTED") return false;

			if (restrictions.status == "ALL PERMITTED") return true;

			if (restrictions.status == "SOME PERMITTED") {
				if (!restrictions.filter) return true; // no filter  (field restrictions may still apply)

				// check the filter
				return new SmartSearchFilter(
					restrictions.filter,
					"file|series|numbers|content|guests|tags"
				).test(this.sandbox);
			}

			return false; // Catch unexpected cases too
		},
	},
	methods: {
		closeDialog() {
			this.expanded = [];
			this.$emit("update:summaryDialog", false);
		},
		updateOrCreateSummary(summary) {
			// submit summary
			const vm = this;
			axios
				.post("/api/songreviewsummary", summary)
				.then(function (response) {
					// update songReviewSummary data if successful
					const foundIndex = vm.songReviewsTable.findIndex(
						(x) => x.file == response.data.file
					);
					if (foundIndex != -1)
						vm.$set(vm.songReviewsTable, foundIndex, response.data);
					else {
						vm.$set(
							vm.songReviewsTable,
							vm.songReviewsTable.length,
							response.data
						);
					}
					//add new source to sources(Array) if doesn't exist
					let newSource = response.data.source;
					if (newSource) {
						if (!vm.sources.some((arrVal) => arrVal === newSource)) {
							vm.sources.push(newSource);
						}
					}
				})
				.catch(function (error) {
					vuetifyToast.error(error + " - song reviews Summary API");
				});
		},
	},
};
</script>