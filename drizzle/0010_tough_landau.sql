CREATE TABLE `budget_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`laborCost` decimal(10,2) NOT NULL DEFAULT '0.00',
	`laborHours` decimal(8,2) NOT NULL DEFAULT '0.00',
	`materialCost` decimal(10,2) NOT NULL DEFAULT '0.00',
	`thirdPartyCost` decimal(10,2) NOT NULL DEFAULT '0.00',
	`otherDirectCosts` decimal(10,2) NOT NULL DEFAULT '0.00',
	`indirectCostsTotal` decimal(10,2) NOT NULL DEFAULT '0.00',
	`profitMargin` decimal(5,2) NOT NULL DEFAULT '20.00',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_templates_id` PRIMARY KEY(`id`)
);
