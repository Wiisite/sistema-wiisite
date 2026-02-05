ALTER TABLE `accountsReceivable` ADD `installmentNumber` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `accountsReceivable` ADD `totalInstallments` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `accountsReceivable` ADD `parentReceivableId` int;