CREATE TABLE `appSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedByUserId` int,
	CONSTRAINT `appSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `appSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `ghlUsers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ghlUserId` varchar(64) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`lastSyncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ghlUsers_id` PRIMARY KEY(`id`),
	CONSTRAINT `ghlUsers_ghlUserId_unique` UNIQUE(`ghlUserId`)
);
--> statement-breakpoint
CREATE TABLE `taskFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`filename` varchar(500) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`uploadedByUserId` int,
	CONSTRAINT `taskFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taskStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`oldStatus` enum('posteingang','in_freigabe','in_bearbeitung','erledigt'),
	`newStatus` enum('posteingang','in_freigabe','in_bearbeitung','erledigt') NOT NULL,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	`changedByUserId` int,
	CONSTRAINT `taskStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ghlTaskId` varchar(64),
	`title` varchar(500) NOT NULL,
	`description` text,
	`status` enum('posteingang','in_freigabe','in_bearbeitung','erledigt') NOT NULL DEFAULT 'posteingang',
	`priority` enum('niedrig','mittel','hoch','dringend') DEFAULT 'mittel',
	`dueDate` timestamp,
	`assignedToUserId` int,
	`assignedToGhlUserId` varchar(64),
	`contactId` varchar(64),
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `tasks_ghlTaskId_unique` UNIQUE(`ghlTaskId`)
);
