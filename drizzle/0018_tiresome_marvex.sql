ALTER TABLE `accountsPayable` ADD `installmentNumber` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `accountsPayable` ADD `totalInstallments` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `accountsPayable` ADD `parentPayableId` int;