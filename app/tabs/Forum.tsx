import { useRouter } from 'expo-router';
import ForumContent from '../../components/tabs/ForumContent';

const Forum = () => {
    const router = useRouter();
    return (
        <ForumContent router={router} />
    );
};

export default Forum;