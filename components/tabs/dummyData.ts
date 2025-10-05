export type BaseMarker =
    {
        latitude: number;
        longitude: number;
        isOnTheRoute: boolean;
        google_place_id: string;
    };

export type BaseMarkerForum =
    {
        isOnTheRoute: boolean;
        google_place_id: string;
    };

export const allMarkers: BaseMarker[] = [
    //Place that is actually in the route
    {
        latitude: 52.516274599999996,
        longitude: 13.377704,
        isOnTheRoute: true,
        google_place_id: "g1"
    },

    {
        latitude: 52.404201699999994,
        longitude: 13.0384999,
        isOnTheRoute: true,
        google_place_id: "g2"
    },

    {
        latitude: 52.600724199999995,
        longitude: 11.863418099999999,
        isOnTheRoute: true,
        google_place_id: "g3"
    },

    {
        latitude: 52.4894113,
        longitude: 10.547574299999999,
        isOnTheRoute: true,
        google_place_id: "g4"
    },

    {
        latitude: 52.267991800000006,
        longitude: 9.9362726,
        isOnTheRoute: false,
        google_place_id: "g5"
    },

    {
        latitude: 52.367991800000006,
        longitude: 9.7362726,
        isOnTheRoute: true,
        google_place_id: "g6"
    },

    {
        latitude: 52.0001,
        longitude: 9.616532,
        isOnTheRoute: false,
        google_place_id: "g7"
    },

    {
        latitude: 52.963246700000006,
        longitude: 9.616532,
        isOnTheRoute: true,
        google_place_id: "g8"
    }
];

export const allMarkersForum: BaseMarkerForum[] = [
    //Place that is actually in the route
    {
        isOnTheRoute: true,
        google_place_id: "g1"
    },

    {
        isOnTheRoute: true,
        google_place_id: "g2"
    },

    {
        isOnTheRoute: true,
        google_place_id: "g3"
    },

    {
        isOnTheRoute: true,
        google_place_id: "g4"
    },

    {
        isOnTheRoute: false,
        google_place_id: "g5"
    },

    {
        isOnTheRoute: true,
        google_place_id: "g6"
    },

    {
        isOnTheRoute: false,
        google_place_id: "g7"
    },

    {
        isOnTheRoute: true,
        google_place_id: "g8"
    }
];