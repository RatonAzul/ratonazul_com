<script lang="ts">
    import {
        AirplaneIcon, CalendarIcon, CameraIcon, CheersIcon, CheeseIcon, DogIcon, FlagIcon,
        ForkKnifeIcon, GiftIcon, HeartIcon, JoystickIcon, MapPinIcon, MusicNoteIcon, PiggyBankIcon, StarIcon, UserIcon
    } from 'phosphor-svelte';
    import FilledSectionIcon from './FilledSectionIcon.svelte';
    import type { CalendarEventIcon } from '$lib/utils/calendar-event-icons';

    let { icon, color }: { icon?: CalendarEventIcon | ''; color?: string } = $props();
    const icons = {
        calendar: CalendarIcon,
        gift: GiftIcon,
        heart: HeartIcon,
        airplane: AirplaneIcon,
        'map-pin': MapPinIcon,
        star: StarIcon,
        food: ForkKnifeIcon,
        music: MusicNoteIcon,
        camera: CameraIcon,
        flag: FlagIcon,
        user: UserIcon,
        dog: DogIcon,
        'piggy-bank': PiggyBankIcon,
        cheese: CheeseIcon,
        cheers: CheersIcon,
        joystick: JoystickIcon
    } satisfies Record<CalendarEventIcon, typeof CalendarIcon>;
    let Icon = $derived(icon ? icons[icon] : undefined);
</script>

{#if Icon}
    {#if color}
        <FilledSectionIcon icon={Icon} {color} />
    {:else}
        <Icon size={16} class="shrink-0" aria-hidden="true" />
    {/if}
{/if}
