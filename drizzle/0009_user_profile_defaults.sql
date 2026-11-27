ALTER TABLE "user" ADD COLUMN "show_image" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "profile_setup_complete" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE "user" SET "profile_setup_complete" = true WHERE btrim(coalesce("username", '')) <> '';
--> statement-breakpoint
CREATE FUNCTION public.initialize_user_notification_groups() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.notification_group_member ("user_id", "group_name")
        SELECT NEW.id, category
        FROM unnest(enum_range(NULL::public.notification_group)) AS category
        WHERE category <> 'admin' OR NEW.role = 'admin'
        ON CONFLICT DO NOTHING;

        INSERT INTO public.notification_group_mute ("user_id", "group_name")
        SELECT NEW.id, category
        FROM unnest(enum_range(NULL::public.notification_group)) AS category
        ON CONFLICT DO NOTHING;
    ELSIF NEW.role = 'admin' AND OLD.role IS DISTINCT FROM 'admin' THEN
        INSERT INTO public.notification_group_member ("user_id", "group_name")
        VALUES (NEW.id, 'admin')
        ON CONFLICT DO NOTHING;
    ELSIF OLD.role = 'admin' AND NEW.role IS DISTINCT FROM 'admin' THEN
        DELETE FROM public.notification_group_member
        WHERE "user_id" = NEW.id AND "group_name" = 'admin';
    END IF;
    RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER user_notification_group_defaults
AFTER INSERT OR UPDATE OF role ON public."user"
FOR EACH ROW EXECUTE FUNCTION public.initialize_user_notification_groups();
