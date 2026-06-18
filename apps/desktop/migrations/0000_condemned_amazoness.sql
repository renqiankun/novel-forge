CREATE TABLE `novel_ai_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`target` text NOT NULL,
	`status` text NOT NULL,
	`queue_order` integer NOT NULL,
	`context_mode` text NOT NULL,
	`review_mode` text NOT NULL,
	`fact_strategy` text NOT NULL,
	`checkpoint_every` integer NOT NULL,
	`auto_pause` text NOT NULL,
	`chapter_id` text,
	`rewrite_task_id` text,
	`instruction` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `novel_app_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `novel_chapter_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`chapter_id` text NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`status` text NOT NULL,
	`body_blob_id` text,
	`summary` text DEFAULT '' NOT NULL,
	`word_count` integer DEFAULT 0 NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `novel_chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`chapter_index` integer NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`intention` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`draft_blob_id` text,
	`word_count` integer DEFAULT 0 NOT NULL,
	`scene_cards_json` text DEFAULT '[]' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `novel_content_blobs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`chapter_id` text,
	`version_id` text,
	`role` text NOT NULL,
	`status` text,
	`relative_path` text NOT NULL,
	`content_hash` text NOT NULL,
	`byte_length` integer NOT NULL,
	`word_count` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `novel_project_records` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`record_kind` text NOT NULL,
	`payload_json` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `novel_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`genre` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'planning' NOT NULL,
	`style_profile_id` text,
	`target_chapters` integer DEFAULT 300 NOT NULL,
	`current_chapter` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `novel_style_asset_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`scope` text DEFAULT '' NOT NULL,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`source` text DEFAULT 'user' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `novel_write_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`task_id` text,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`actor` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `story_facts` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`source` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `novel_projects`(`id`) ON UPDATE no action ON DELETE no action
);
