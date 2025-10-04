import { useRouter } from 'expo-router';
import ForumContent from '../../components/tabs/forum-content';

const Forum = () => {
    const router = useRouter();
    return (
        <ForumContent router={router} />
    );
};

export default Forum;