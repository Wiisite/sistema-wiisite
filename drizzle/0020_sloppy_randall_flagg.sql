ALTER TABLE `budget_items` MODIFY COLUMN `type` enum('labor','material','thirdparty','indirect','other','service') NOT NULL;--> statement-breakpoint
ALTER TABLE `budget_items` ADD `productId` int;--> statement-breakpoint
ALTER TABLE `budget_items` ADD CONSTRAINT `budget_items_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;