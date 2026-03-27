CREATE TABLE `sticky_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`color` varchar(20) NOT NULL DEFAULT 'yellow',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sticky_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sticky_notes` ADD CONSTRAINT `sticky_notes_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;