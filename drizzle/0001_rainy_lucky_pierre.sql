ALTER TABLE `chapters` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `chapters` ADD `view_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `trust_score` integer DEFAULT 0;