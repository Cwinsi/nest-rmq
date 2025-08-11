# @cwinsi/nest-rmq
![npm](https://img.shields.io/npm/v/@cwinsi/nest-rmq)
![npm](https://img.shields.io/npm/dm/@cwinsi/nest-rmq)
![License](https://img.shields.io/npm/l/@cwinsi/nest-rmq)

A lightweight and modular RabbitMQ integration for NestJS.  
Supports declarative event producers and consumers, simple modular design.


> [!WARNING]  
> The lib is under active development, not recommended for use in production until<br>
> a stable version is released. The API may change and be supplemented.

## ✨ Features

- 🔌 Plug-and-play RabbitMQ support for NestJS
- ✅ Automatic queue declaration and binding


## 🚧 Basic Usage:
### 📦 Installation

```bash
npm install @cwinsi/nest-rmq
# or
yarn add @cwinsi/nest-rmq
```


### 🚀 Getting Started

Static Configuration
```ts
import { Module } from '@nestjs/common'
import { NestRmqModule } from '@cwinsi/nest-rmq'

@Module({
  imports: [
    NestRmqModule.forFeature({
      connectionOption: {
        // 🔑 your configs
      },
    }),
  ],
})
export class AppModule {}
```


Async Configuration
```ts
import { Module } from '@nestjs/common'
import { NestRmqModule } from '@cwinsi/nest-rmq'

@Module({
  imports: [
    ConfigsModule.forRoot(),
    NestRmqModule.forRootAsync({
      useFactory: async (config: RmqConfig) => ({
        connectionOption: {
          hostname: config.password,
          username: config.username,
          password: config.password,
        },
      }),
      inject: [RmqConfig],
    }),
  ],
})
export class AppModule {}
```

### 🧨 Declaring Events
Create class to declare event, use @Event decorator to mark your class as event.<br>
Event has name argument, the name affects to exchange and queues names. You have to give uniq name to your events.

```ts
@Event('user.created')
class UserCreatedEvent {
  constructor(public readonly userId: string) {}
}
```
After declaring you can register events using NestRmqModule.<br>
Registration required to create producer providers
```ts
@Module({
  imports: [
    NestRmqModule.forFeature([UserCreatedEvent]),
  ],
})
export class UserModule {}
```

### 📤 Producing Events
You can inject producers in your providers using **@InjectEventProducer** decorator
```ts
@Injectable()
export class UserService {
  constructor(
    @InjectEventProducer(UserCreatedEvent)
    private readonly userCreatedProducer: EventProducer<UserCreatedEvent>,
  ) {}

  async createUser() {
    // ... create user logic
    await this.userCreatedProducer.publish(new UserCreatedEvent(uuid.v4()));
  }
}
```

### 📧 Processing events
Use **@InjectEventProducer** on method to process events
```ts
@Injectable()
class UserEmailNotificationService {
  @EventHandler(UserCreatedEvent)
  async handle(event: UserCreatedEvent): Promise<void> {
    console.log(`Sending welcome email to user ${event.userId}`)
  }
}
```

🔥 ENJOY

## 🚧 Planned:
- Check event name duplicates on app startup
- Logging
- Different serialisation formats


## ⚙️ Advanced topics
### 🚨 Processing events
If necessary, EventDeliveryContext is provided to manage **ack**/**nack** execution, use @EventDelivery decorator in handler arguments.
> [!WARNING]  
> When you use @EventDelivery in handler **ack**/**nack** will not call after handler resolve. You HAVE TO call one of them manually

Let's use delivery context on UserEmailNotificationService:
```ts
@Injectable()
class UserEmailNotificationService {
  @EventHandler(UserCreatedEvent)
  async handle(
    event: UserCreatedEvent,
    @EventDelivery() eventDelivery: EventDeliveryContext
  ): Promise<void> {
    console.log(`Sending welcome email to user ${event.userId}`)
    eventDelivery.ack()
  }
}
```

### 🏭 Exchange control
Default exchange strategy create one exchange **nest-rmq**. You can use different one from lib or create own.

| Strategy                   | Description                     | Notes    |
|----------------------------|---------------------------------|----------|
| **SingleExchangeStrategy**     | Create one exchange for all app | default |
| **EveryEventExchangeStrategy** | Create exchange for each event  |          |

If you need own exchange topology, create implementation of **EventsExchangeStrategy** interface.
Use one of existed or own strategy in module config
Static Configuration
```ts
import { Module } from '@nestjs/common'
import { NestRmqModule } from '@cwinsi/nest-rmq'

@Module({
  imports: [
    NestRmqModule.forFeature({
      connectionOption: {
        // 🔑 your configs
      },
      eventsExchangeStrategy: new EveryEventExchangeStrategy()
    }),
  ],
})
export class AppModule {}
```
### 🚨 Message properties
If you need access to rmq raw properties, use @EventProperties decorator in handler arguments.
```ts
@Injectable()
class UserEmailNotificationService {
  @EventHandler(UserCreatedEvent)
  async handle(
    event: UserCreatedEvent,
    @EventProperties() eventPropertiesContext: EventPropertiesContext
  ): Promise<void> {
    console.log(`Sending welcome email to user ${event.userId}`)
    console.log('Headers', eventPropertiesContext.headers)
  }
}
```