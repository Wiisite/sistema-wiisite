CREATE TABLE `product_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`customerId` int NOT NULL,
	`frequency` enum('monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly',
	`price` decimal(10,2) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`lastBilled` timestamp,
	`nextBillingDate` timestamp NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurring_expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('electricity','water','phone','internet','rent','insurance','software','maintenance','other') NOT NULL DEFAULT 'other',
	`supplierId` int,
	`amount` decimal(10,2) NOT NULL,
	`frequency` enum('monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly',
	`dayOfMonth` int NOT NULL DEFAULT 1,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`lastGenerated` timestamp,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recurring_expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `product_subscriptions` ADD CONSTRAINT `product_subscriptions_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_subscriptions` ADD CONSTRAINT `product_subscriptions_customerId_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_subscriptions` ADD CONSTRAINT `product_subscriptions_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurring_expenses` ADD CONSTRAINT `recurring_expenses_supplierId_suppliers_id_fk` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurring_expenses` ADD CONSTRAINT `recurring_expenses_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;