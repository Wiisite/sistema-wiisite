CREATE TABLE `budget_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`budgetId` int NOT NULL,
	`type` enum('labor','material','thirdparty','indirect','other') NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` decimal(10,2) NOT NULL DEFAULT '1.00',
	`unitPrice` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budget_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`laborCost` decimal(10,2) NOT NULL DEFAULT '0.00',
	`laborHours` decimal(8,2) NOT NULL DEFAULT '0.00',
	`materialCost` decimal(10,2) NOT NULL DEFAULT '0.00',
	`thirdPartyCost` decimal(10,2) NOT NULL DEFAULT '0.00',
	`otherDirectCosts` decimal(10,2) NOT NULL DEFAULT '0.00',
	`indirectCostsTotal` decimal(10,2) NOT NULL DEFAULT '0.00',
	`profitMargin` decimal(5,2) NOT NULL DEFAULT '20.00',
	`cbsRate` decimal(5,2) NOT NULL,
	`ibsRate` decimal(5,2) NOT NULL,
	`irpjRate` decimal(5,2) NOT NULL,
	`csllRate` decimal(5,2) NOT NULL,
	`totalDirectCosts` decimal(10,2) NOT NULL,
	`totalCosts` decimal(10,2) NOT NULL,
	`grossValue` decimal(10,2) NOT NULL,
	`cbsAmount` decimal(10,2) NOT NULL,
	`ibsAmount` decimal(10,2) NOT NULL,
	`totalConsumptionTaxes` decimal(10,2) NOT NULL,
	`netRevenue` decimal(10,2) NOT NULL,
	`profitBeforeTaxes` decimal(10,2) NOT NULL,
	`irpjAmount` decimal(10,2) NOT NULL,
	`csllAmount` decimal(10,2) NOT NULL,
	`netProfit` decimal(10,2) NOT NULL,
	`finalPrice` decimal(10,2) NOT NULL,
	`taxRegime` enum('new','old','transition') NOT NULL DEFAULT 'new',
	`status` enum('draft','sent','approved','rejected') NOT NULL DEFAULT 'draft',
	`validUntil` timestamp,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cbsRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`ibsRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`irpjRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`csllRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`minimumMargin` decimal(5,2) NOT NULL DEFAULT '20.00',
	`taxRegime` enum('new','old','transition') NOT NULL DEFAULT 'new',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tax_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `budget_items` ADD CONSTRAINT `budget_items_budgetId_budgets_id_fk` FOREIGN KEY (`budgetId`) REFERENCES `budgets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_customerId_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;