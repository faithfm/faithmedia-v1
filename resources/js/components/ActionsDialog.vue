<template>
	<v-dialog :value="value != null" @input="closeDialog" max-width="800" overlay-opacity="0.1">
		<v-card>
			<v-btn icon absolute right top @click="closeDialog">
				<v-icon>mdi-close</v-icon>
			</v-btn>
			<v-card-title class="justify-content-center">Actions</v-card-title>
			<v-card-actions class="justify-content-center">
				<v-chip-group>
					<v-chip label outlined color="red darken-4" @click="$emit('playTrack',sandbox.file); closeDialog()">
						<v-icon>mdi-play</v-icon>Play
					</v-chip>
					<v-chip
						label
						outlined
						color="red darken-4"
						:href="musixMatchLyrics"
						v-show="sandbox.file && sandbox.file.startsWith('music/')"
						target="_blank"
					>
						<v-icon>mdi-music-circle-outline</v-icon>Lyrics
					</v-chip>
				</v-chip-group>
			</v-card-actions>
			<v-divider></v-divider>
			<v-expansion-panels>
				<v-expansion-panel>
					<v-expansion-panel-header>Edit</v-expansion-panel-header>
					<v-expansion-panel-content>
						<v-alert
							v-show="!canEdit"
							type="error"
						>You don't have permission to edit this area.</v-alert>

						<v-form
							v-show="canEdit"
							lazy-validation
							v-model="formIsValid"
						>
								<v-col
									cols="12"
									v-for="(config, fieldName) in combinedConfig"
									:key="fieldName"
								>
									<v-text-field
										v-model.trim="sandbox[fieldName]"
										:rules="getFieldRules(config)"
										:label="getTitle(config)"
										:disabled="config.disabled || (userAllowedFields ? !userAllowedFields.includes(fieldName) : false)"
										:required="config.required"
										:background-color="fieldIsDirty(fieldName) ? 'grey lighten-2' : null"
										dense
										clearable
									></v-text-field>
								</v-col>

								<v-row class="justify-content-center">
									<v-btn
										color="success"
										:disabled="!formIsValid || !formIsDirty"
										@click="$emit('updateContentDb', sandbox ); closeDialog();"
									>Save</v-btn>
								</v-row>
						</v-form>
					</v-expansion-panel-content>
				</v-expansion-panel>
				<v-expansion-panel>
					<v-expansion-panel-header>Download</v-expansion-panel-header>
					<v-expansion-panel-content>
						<v-card-actions class="justify-center">
							<v-chip-group column>
								<v-chip
									class="downloadBtn"
									:href="oggDownloadUrl"
									download
									@click="closeDialog"
								>OGG master</v-chip>
								<v-chip
									class="downloadBtn"
									:href="mp3DownloadUrl"
									download
									@click="closeDialog"
								>MP3 low-quality</v-chip>
								<v-chip
									class="downloadBtn"
									:href="origDownloadUrl"
									download
									@click="closeDialog"
								>MP3 original</v-chip>
							</v-chip-group>
						</v-card-actions>
					</v-expansion-panel-content>
				</v-expansion-panel>
			</v-expansion-panels>
		</v-card>
	</v-dialog>
</template>

<script>
import { oggUrl, mp3Url, origUrl } from "../DbContentUrls";
import { SmartSearchFilter } from "../SmartSearchFilter";
import { laravelUserRestrictions } from "../LaravelUserPermissions";

import vuetifyToast from "../VuetifyToast";
vuetifyToast.setDefaults({ toastParentId:'player' });

// Object map helper functions - inspired by: https://stackoverflow.com/questions/14810506/map-function-for-objects-instead-of-arrays
const objectMapfromObject = (obj, fn) =>
	Object.fromEntries(
		Object.entries(obj).map(
			([k, v], i) => [k, fn(k, v, i)]
		)
	)
const objectMapfromArray = (arr, fn) =>
	Object.fromEntries(
		arr.map(
			(k, i) => [k, fn(k, i)]
		)
	)


export default {
	props: {
		value: Object,	// original content item - ie: { file:"xyz.ogg", series:"My Series", ... }
		formFieldNames: { type:Array, required:true },
		defaultFieldConfig: { type:Object, default:{} },
		fieldConfig: { type:Object, default:{} },
	},
	data() {
		return {
			sandbox: {},								// sandbox is a local copy of field data used to bind to the form elements.  This modified data is what is submitted when the form is saved.
			jsonErrorShownOnce: false,	// only show popup-JSON-error once
			formIsValid: false,					// bound to v-form's v-model, this relies on lazy-validation
		};
	},
	watch: {
		value: function(val) {
			const defaultSandbox = objectMapfromObject(this.combinedConfig,
				(fieldName, config) => config.defaultValue
			);
			this.sandbox = { ...defaultSandbox, ...val };				// whenever 'value' (v-model) changes, set the initial value value of 'sandbox' to match
		}
	},
	computed: {
		// console: () => console,		// make console.XXX available in templates
		combinedConfig() {
			const baselineFieldConfig = { defaultValue:'', title:null, required:false, disabled:false, maxLength:0 };
			return objectMapfromArray(this.formFieldNames,
				fieldName => ({ fieldName:fieldName, ...baselineFieldConfig, ...this.defaultFieldConfig, ...this.fieldConfig[fieldName] })
			);
		},
		formIsDirty() {
			return this.formFieldNames.some(fieldName => this.fieldIsDirty(fieldName))
		},
		oggDownloadUrl() {
			return oggUrl(this.sandbox.file, LaravelAppGlobals.config);
		},
		mp3DownloadUrl() {
			return mp3Url(this.sandbox.file, LaravelAppGlobals.config);
		},
		origDownloadUrl() {
			return origUrl(this.sandbox.file, LaravelAppGlobals.config);
		},
		musixMatchLyrics() {
			return (
				"https://www.musixmatch.com/search/" +
				encodeURIComponent(this.sandbox.guests + " - " + this.sandbox.content)
			);
		},

		canEdit() {
			const restrictions = laravelUserRestrictions('edit-content');

			if (restrictions.error && !this.jsonErrorShownOnce) {
				vuetifyToast.error("Your user profile contains an invalid permission restriction code. \nPlease contact your administrator for help.");
				this.jsonErrorShownOnce = true;
			}

			if (restrictions.status == "NOT PERMITTED")
				return false;

			if (restrictions.status == "ALL PERMITTED")
				return true;

			if (restrictions.status == "SOME PERMITTED") {
				if (!restrictions.filter)
					return true;	// no filter  (field restrictions may still apply)

				// check the filter
				return new SmartSearchFilter(
					restrictions.filter,
					"file|series|numbers|content|guests|tags"
				).test(this.sandbox);
			}

			return false;		// Catch unexpected cases too
		},
		userAllowedFields() {
			const restrictions = laravelUserRestrictions('edit-content');
			return restrictions.fields ? restrictions.fields : null
		},
	},
	methods: {
		closeDialog() {
			this.$emit("input", null);
		},
		fieldIsDirty(fieldName) {
			if (!this.value || !this.sandbox || !(fieldName in this.value) || !(fieldName in this.sandbox))
				return false;
			return  this.value[fieldName] !== this.sandbox[fieldName];
		},
		titleCase(str) {
  		return str.toLowerCase().split(' ').map(
				word => (word.charAt(0).toUpperCase() + word.slice(1))
			).join(' ');
		},
		getTitle(config) {
			return config.title || this.titleCase(config.fieldName);
		},
		getFieldRules(config) {
			let rules = []
			if (config.required)
				rules.push(v => !!v || `${this.getTitle(config)} is required`);
			if (config.maxLength)
				rules.push(v => (v || "").length <= config.maxLength || `${this.getTitle(config)} must be less than ${config.maxLength} characters`);
			return rules;
		},
	}
};
</script>

<style scoped>
.downloadBtn{
	margin: 4px 0;
	color: rgb(211,47,47);
	border-width: thin;
    border-style: solid;
	border-color: rgb(211,47,47);
	background-color:transparent !important;
}
</style>

